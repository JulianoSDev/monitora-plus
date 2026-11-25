import re

from flask_jwt_extended import create_access_token
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from api.common import ServiceError, clean_text, transactional
from api.offerings.services import OfferingService
from extensions import bcrypt, db

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
RA_RE = re.compile(r"^\d{5,12}$")

MIN_PASSWORD_LENGTH = 4  # mesmo valor do front; considere subir para 8
MAX_PASSWORD_BYTES = 72  # limite do bcrypt

COURSES = ["ES1A", "ES1B", "S1"]

USER_COLUMNS = "id, role, name, ra, email, course, offering_id"

_dummy_hash: str | None = None


def _password_ok_length(password) -> bool:
    return isinstance(password, str) and len(password.encode("utf-8")) <= MAX_PASSWORD_BYTES


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
        course = clean_text(data.get("course"))
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
            if course not in COURSES:
                errors["course"] = "Selecione uma turma válida."
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
    @transactional
    def delete_account(user_id: int) -> None:
        # Agendamentos e preferências saem em cascata; horários publicados ficam (created_by = NULL).
        db.session.execute(text("DELETE FROM users WHERE id = :id"), {"id": user_id})
