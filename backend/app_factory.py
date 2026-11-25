from flask import Flask, jsonify

from api.common import ServiceError
from extensions import bcrypt, cors, db, jwt, migrate
from dotenv import load_dotenv
import os
from datetime import timedelta

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    #Configurações do app ():
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
    app.config["JWT_COOKIE_CSRF_PROTECT"] = True
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_COOKIE_SECURE"] = os.getenv("JWT_COOKIE_SECURE", "True").lower() == "true"
    app.config["JWT_COOKIE_SAMESITE"] = os.getenv("JWT_COOKIE_SAMESITE", "Lax")
    if app.config["JWT_COOKIE_SAMESITE"] == "None" and not app.config["JWT_COOKIE_SECURE"]:
        raise ValueError("SameSite=None exige JWT_COOKIE_SECURE=True (HTTPS).")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=int(os.getenv("JWT_EXPIRES_HOURS", "8")))
    app.config["TIMEZONE"] = os.getenv("TIMEZONE", "America/Sao_Paulo")

    app.url_map.strict_slashes = False  # /api/offerings e /api/offerings/ funcionam
    app.json.sort_keys = False  # mantém a ordem dos campos como escrita no código






    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
    cors.init_app(app, supports_credentials=True, origins=origins)

    import models  # noqa: F401  (registra as tabelas no metadata do SQLAlchemy)
    from api import api_bp

    app.register_blueprint(api_bp)

    register_error_handlers(app)
    return app


def _error(message: str, status: int, fields: dict | None = None):
    body = {"error": message}
    if fields:
        body["fields"] = fields
    return jsonify(body), status


def register_error_handlers(app: Flask):
    @app.errorhandler(ServiceError)
    def handle_service_error(err: ServiceError):
        return _error(err.message, err.status, err.fields)

    # --- erros do JWT (token ausente, inválido, expirado, CSRF) ---
    @jwt.unauthorized_loader
    def missing_token(reason: str):
        # A extensão usa este mesmo callback para "sem cookie" e para falha de CSRF.
        # CSRF vira 403 (o front não deve tratar como "sessão expirada").
        if "CSRF" in reason:
            return _error(
                "Token CSRF ausente ou inválido. Envie o valor do cookie csrf_access_token "
                "no header X-CSRF-TOKEN.",
                403,
            )
        return _error("Faça login para continuar.", 401)

    @jwt.invalid_token_loader
    def invalid_token(reason: str):
        return _error("Sessão inválida. Faça login novamente.", 401)

    @jwt.expired_token_loader
    def expired_token(jwt_header, jwt_payload):
        return _error("Sua sessão expirou. Faça login novamente.", 401)

    # --- erros HTTP comuns, sempre em JSON ---
    @app.errorhandler(404)
    def not_found(_):
        return _error("Rota não encontrada.", 404)

    @app.errorhandler(405)
    def method_not_allowed(_):
        return _error("Método não permitido para esta rota.", 405)

    @app.errorhandler(500)
    def internal_error(_):
        return _error("Erro interno do servidor.", 500)


if __name__ == "__main__":
    create_app().run(debug=True)
