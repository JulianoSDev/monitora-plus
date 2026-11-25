import re
import secrets

from flask import current_app
from flask_jwt_extended import create_access_token
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from api.common import ServiceError, clean_text, transactional
from api.offerings.services import OfferingService
from extensions import bcrypt, db

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
RA_RE = re.compile(r"^\d{5,12}$")

MIN_PASSWORD_LENGTH = 4  # mesmo valor do front; considere subir para 8
MAX_PASSWORD_BYTES = 72  # limite do bcrypt
GOOGLE_ONBOARDING_SALT = "monitora-google-onboarding-v1"
GOOGLE_ONBOARDING_MAX_AGE = 900  # 15 minutos

USER_COLUMNS = "id, role, name, ra, email, course, offering_id, avatar_url, (google_sub IS NOT NULL) AS has_google"

_dummy_hash: str | None = None


def _password_ok_length(password) -> bool:
    return isinstance(password, str) and len(password.encode("utf-8")) <= MAX_PASSWORD_BYTES


def _onboarding_serializer() -> URLSafeTimedSerializer:
    secret = current_app.config.get("SECRET_KEY") or current_app.config.get("JWT_SECRET_KEY")
    if not secret:
        raise ServiceError("Configuração de segurança incompleta no servidor.", 500)
    return URLSafeTimedSerializer(secret, salt=GOOGLE_ONBOARDING_SALT)


def _sanitize_avatar_url(value) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = value.strip()
    if not cleaned or len(cleaned) > 500:
        return None
    if not (cleaned.startswith("https://") or cleaned.startswith("http://")):
        return None
    return cleaned


class AuthService:
    @staticmethod
    def get_user(user_id: int) -> dict | None:
        row = db.session.execute(
            text(f"SELECT {USER_COLUMNS} FROM users WHERE id = :id"), {"id": user_id}
        ).mappings().first()
        return dict(row) if row else None

    @staticmethod
    def issue_token(user_id: int) -> str:
        return create_access_token(identity=str(user_id))

    @staticmethod
    @transactional
    def register(data: dict) -> tuple[dict, str]:
        role = data.get("role")
        name = " ".join(clean_text(data.get("name")).split())
        ra = clean_text(data.get("ra"))
        email = clean_text(data.get("email")).lower()
        password = data.get("password")
        course_raw = data.get("course")
        course = " ".join(course_raw.split()) if isinstance(course_raw, str) else ""
        offering_id = clean_text(data.get("offering_id"))
        professor_code = clean_text(data.get("professor_code")).upper()

        errors: dict[str, str] = {}

        if role not in ("student", "monitor"):
            errors["role"] = "Perfil inválido. Use 'student' ou 'monitor'."
        if len(name) < 3:
            errors["name"] = "Informe seu nome completo (mínimo 3 caracteres)."
        elif len(name) > 70:
            errors["name"] = "O nome pode ter no máximo 70 caracteres."
        if not RA_RE.match(ra):
            errors["ra"] = "A matrícula deve conter de 5 a 12 números."
        if not EMAIL_RE.match(email) or len(email) > 120:
            errors["email"] = "Informe um e-mail institucional válido."
        if not isinstance(password, str) or len(password) < MIN_PASSWORD_LENGTH:
            errors["password"] = f"A senha deve ter no mínimo {MIN_PASSWORD_LENGTH} caracteres."
        elif not _password_ok_length(password):
            errors["password"] = "A senha é longa demais (máximo de 72 bytes)."

        offering = None
        if role == "student":
            if not course or len(course) > 80 or any(ord(c) < 32 for c in course):
                errors["course"] = "Informe uma turma válida com até 80 caracteres."
        elif role == "monitor":
            offering = db.session.execute(
                text("SELECT id, professor_code_hash FROM offerings WHERE id = :id"),
                {"id": offering_id},
            ).mappings().first()
            if not offering:
                errors["offering_id"] = "Selecione uma disciplina válida."
            if not professor_code:
                errors["professor_code"] = "Informe o código autorizado pelo professor."

        if errors:
            raise ServiceError("Dados inválidos. Corrija os campos destacados.", 422, errors)

        # Duplicidade de matrícula/e-mail
        taken: dict[str, str] = {}
        if db.session.execute(text("SELECT 1 FROM users WHERE ra = :ra"), {"ra": ra}).first():
            taken["ra"] = "Já existe uma conta cadastrada com esta matrícula."
        if db.session.execute(text("SELECT 1 FROM users WHERE email = :e"), {"e": email}).first():
            taken["email"] = "Já existe uma conta cadastrada com este e-mail."
        if taken:
            raise ServiceError("Matrícula ou e-mail já cadastrados.", 409, taken)

        # Código do professor (só depois de validar o resto)
        if role == "monitor" and not OfferingService.check_professor_code(
            offering["professor_code_hash"], professor_code
        ):
            raise ServiceError(
                "Código inválido para esta disciplina. Solicite o código ao professor.",
                403,
                {"professor_code": "Código inválido para esta disciplina."},
            )

        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        try:
            row = db.session.execute(
                text(
                    f"""
                    INSERT INTO users (role, name, ra, email, password_hash, course, offering_id)
                    VALUES (:role, :name, :ra, :email, :ph, :course, :offering_id)
                    RETURNING {USER_COLUMNS}
                    """
                ),
                {
                    "role": role,
                    "name": name,
                    "ra": ra,
                    "email": email,
                    "ph": password_hash,
                    "course": course if role == "student" else None,
                    "offering_id": offering_id if role == "monitor" else None,
                },
            ).mappings().one()
        except IntegrityError:
            # Corrida entre dois cadastros iguais: o índice único do banco barrou o segundo.
            raise ServiceError(
                "Matrícula ou e-mail já cadastrados.",
                409,
                {"ra": "Já existe uma conta com esta matrícula ou e-mail."},
            )

        user = dict(row)
        return user, AuthService.issue_token(user["id"])

    @staticmethod
    def login(data: dict) -> tuple[dict, str]:
        identifier = clean_text(data.get("identifier")).lower()
        password = data.get("password")

        errors: dict[str, str] = {}
        if not identifier:
            errors["identifier"] = "Informe sua matrícula ou e-mail institucional."
        if not isinstance(password, str) or not password:
            errors["password"] = "Digite sua senha para continuar."
        if errors:
            raise ServiceError("Dados inválidos. Corrija os campos destacados.", 422, errors)

        row = db.session.execute(
            text(f"SELECT {USER_COLUMNS}, password_hash FROM users WHERE ra = :i OR email = :i"),
            {"i": identifier},
        ).mappings().first()

        # Compara sempre contra algum hash, para que usuário inexistente e senha errada
        # demorem o mesmo tempo (não revela quais matrículas existem).
        global _dummy_hash
        if _dummy_hash is None:
            _dummy_hash = bcrypt.generate_password_hash("dummy-password").decode("utf-8")

        valid = False
        if _password_ok_length(password):
            valid = bcrypt.check_password_hash(row["password_hash"] if row else _dummy_hash, password)

        if not row or not valid:
            raise ServiceError(
                "Matrícula/e-mail ou senha inválidos. Confira os dados e tente novamente.",
                401,
                {"password": "Matrícula/e-mail ou senha inválidos. Confira os dados e tente novamente."},
            )

        user = {k: v for k, v in dict(row).items() if k != "password_hash"}
        return user, AuthService.issue_token(user["id"])

    @staticmethod
    def get_providers_status() -> dict:
        google_client_id = (current_app.config.get("GOOGLE_CLIENT_ID") or "").strip()
        gennera_ready = all(
            (current_app.config.get(k) or "").strip()
            for k in ("GENNERA_API_URL", "GENNERA_API_TOKEN", "GENNERA_INSTITUTION_ID")
        )
        return {
            "google": {
                "enabled": bool(google_client_id),
                "client_id": google_client_id or None,
            },
            "gennera": {
                "enabled": gennera_ready,
            },
        }

    @staticmethod
    def verify_google_credential(credential: str) -> dict:
        client_id = (current_app.config.get("GOOGLE_CLIENT_ID") or "").strip()
        if not client_id:
            raise ServiceError(
                "Login com Google ainda não está configurado no servidor (GOOGLE_CLIENT_ID ausente).",
                503,
            )
        if not isinstance(credential, str) or not credential.strip():
            raise ServiceError("Token de autenticação do Google ausente.", 422, {"credential": "Token inválido."})

        try:
            payload = google_id_token.verify_oauth2_token(
                credential.strip(),
                google_requests.Request(),
                client_id,
            )
        except Exception:
            raise ServiceError("Não foi possível validar sua conta Google. Tente entrar novamente.", 401)

        iss = payload.get("iss")
        if iss not in ("accounts.google.com", "https://accounts.google.com"):
            raise ServiceError("Emissor do token Google inválido.", 401)
        if not payload.get("email_verified"):
            raise ServiceError("Sua conta Google precisa ter um e-mail verificado.", 401)

        sub = clean_text(payload.get("sub"))
        email = clean_text(payload.get("email")).lower()
        name = " ".join(clean_text(payload.get("name") or email.split("@")[0]).split())[:70]
        avatar_url = _sanitize_avatar_url(payload.get("picture"))
        if not sub or not EMAIL_RE.match(email):
            raise ServiceError("Dados da conta Google incompletos.", 401)

        return {"sub": sub, "email": email, "name": name, "avatar_url": avatar_url}

    @staticmethod
    @transactional
    def authenticate_google(data: dict) -> dict:
        profile = AuthService.verify_google_credential(data.get("credential"))

        row = db.session.execute(
            text(f"SELECT {USER_COLUMNS}, google_sub FROM users WHERE google_sub = :sub OR email = :email LIMIT 1"),
            {"sub": profile["sub"], "email": profile["email"]},
        ).mappings().first()

        if row:
            if row["google_sub"] and row["google_sub"] != profile["sub"]:
                raise ServiceError("Este e-mail já está vinculado a outra conta Google.", 409)
            updated = db.session.execute(
                text(
                    f"""
                    UPDATE users
                    SET google_sub = :sub,
                        avatar_url = COALESCE(:avatar, avatar_url)
                    WHERE id = :id
                    RETURNING {USER_COLUMNS}
                    """
                ),
                {"sub": profile["sub"], "avatar": profile["avatar_url"], "id": row["id"]},
            ).mappings().one()
            user = dict(updated)
            return {"needs_onboarding": False, "user": user, "token": AuthService.issue_token(user["id"])}

        onboarding_token = _onboarding_serializer().dumps(profile)
        return {
            "needs_onboarding": True,
            "onboarding_token": onboarding_token,
            "profile": {
                "name": profile["name"],
                "email": profile["email"],
                "avatar_url": profile["avatar_url"],
            },
        }

    @staticmethod
    @transactional
    def complete_google_registration(data: dict) -> tuple[dict, str]:
        raw_token = data.get("onboarding_token")
        if not isinstance(raw_token, str) or not raw_token.strip():
            raise ServiceError("Sessão de cadastro Google ausente. Entre com Google novamente.", 401)

        try:
            profile = _onboarding_serializer().loads(raw_token.strip(), max_age=GOOGLE_ONBOARDING_MAX_AGE)
        except SignatureExpired:
            raise ServiceError("Seu tempo para concluir o cadastro Google expirou. Clique em Google novamente.", 401)
        except BadSignature:
            raise ServiceError("Token de cadastro Google inválido. Clique em Google novamente.", 401)

        sub = clean_text(profile.get("sub"))
        email = clean_text(profile.get("email")).lower()
        avatar_url = _sanitize_avatar_url(profile.get("avatar_url"))

        role = data.get("role")
        name = " ".join(clean_text(data.get("name") or profile.get("name")).split())
        ra = clean_text(data.get("ra"))
        course_raw = data.get("course")
        course = " ".join(course_raw.split()) if isinstance(course_raw, str) else ""
        offering_id = clean_text(data.get("offering_id"))
        professor_code = clean_text(data.get("professor_code")).upper()

        errors: dict[str, str] = {}
        if role not in ("student", "monitor"):
            errors["role"] = "Perfil inválido. Use 'student' ou 'monitor'."
        if len(name) < 3:
            errors["name"] = "Informe seu nome completo (mínimo 3 caracteres)."
        elif len(name) > 70:
            errors["name"] = "O nome pode ter no máximo 70 caracteres."
        if not RA_RE.match(ra):
            errors["ra"] = "A matrícula deve conter de 5 a 12 números."

        offering = None
        if role == "student":
            if not course or len(course) > 80 or any(ord(c) < 32 for c in course):
                errors["course"] = "Informe uma turma válida com até 80 caracteres."
        elif role == "monitor":
            offering = db.session.execute(
                text("SELECT id, professor_code_hash FROM offerings WHERE id = :id"),
                {"id": offering_id},
            ).mappings().first()
            if not offering:
                errors["offering_id"] = "Selecione uma disciplina válida."
            if not professor_code:
                errors["professor_code"] = "Informe o código autorizado pelo professor."

        if errors:
            raise ServiceError("Dados inválidos. Corrija os campos destacados.", 422, errors)

        taken: dict[str, str] = {}
        if db.session.execute(text("SELECT 1 FROM users WHERE ra = :ra"), {"ra": ra}).first():
            taken["ra"] = "Já existe uma conta cadastrada com esta matrícula."
        if db.session.execute(
            text("SELECT 1 FROM users WHERE email = :e OR google_sub = :sub"),
            {"e": email, "sub": sub},
        ).first():
            taken["email"] = "Já existe uma conta vinculada a este e-mail Google. Volte e clique em Google para entrar."
        if taken:
            raise ServiceError("Matrícula ou conta Google já cadastradas.", 409, taken)

        if role == "monitor" and not OfferingService.check_professor_code(
            offering["professor_code_hash"], professor_code
        ):
            raise ServiceError(
                "Código inválido para esta disciplina. Solicite o código ao professor.",
                403,
                {"professor_code": "Código inválido para esta disciplina."},
            )

        # Senha aleatória irrecuperável (usuário entra pelo Google; não expõe password_hash NULL).
        random_secret = secrets.token_urlsafe(32)
        password_hash = bcrypt.generate_password_hash(random_secret).decode("utf-8")

        try:
            row = db.session.execute(
                text(
                    f"""
                    INSERT INTO users (role, name, ra, email, password_hash, course, offering_id, google_sub, avatar_url)
                    VALUES (:role, :name, :ra, :email, :ph, :course, :offering_id, :sub, :avatar)
                    RETURNING {USER_COLUMNS}
                    """
                ),
                {
                    "role": role,
                    "name": name,
                    "ra": ra,
                    "email": email,
                    "ph": password_hash,
                    "course": course if role == "student" else None,
                    "offering_id": offering_id if role == "monitor" else None,
                    "sub": sub,
                    "avatar": avatar_url,
                },
            ).mappings().one()
        except IntegrityError:
            raise ServiceError(
                "Matrícula ou conta Google já cadastradas.",
                409,
                {"ra": "Já existe uma conta com esta matrícula ou conta Google."},
            )

        user = dict(row)
        return user, AuthService.issue_token(user["id"])

    @staticmethod
    def authenticate_gennera(data: dict) -> tuple[dict, str]:
        api_url = (current_app.config.get("GENNERA_API_URL") or "").strip()
        api_token = (current_app.config.get("GENNERA_API_TOKEN") or "").strip()
        inst_id = (current_app.config.get("GENNERA_INSTITUTION_ID") or "").strip()
        if not (api_url and api_token and inst_id):
            raise ServiceError(
                "Integração institucional Gennera (UNIFSA) aguardando credenciais oficiais da TI (GENNERA_API_TOKEN).",
                503,
            )
        raise ServiceError(
            "Conector Gennera configurado, mas a validação SAML/Webservice da instituição ainda precisa ser homologada com a TI.",
            501,
        )

    @staticmethod
    @transactional
    def delete_account(user_id: int) -> None:
        # Agendamentos e preferências saem em cascata; horários publicados ficam (created_by = NULL).
        db.session.execute(text("DELETE FROM users WHERE id = :id"), {"id": user_id})
