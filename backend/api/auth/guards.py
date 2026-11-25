"""Decorators de autenticação/autorização usados pelas rotas de todos os módulos."""

from functools import wraps

from flask import g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from api.common import ServiceError

from .services import AuthService


def auth_required(fn):
    """Exige cookie JWT válido (e header X-CSRF-TOKEN nos métodos que alteram dados).

    Deixa o usuário logado em `g.current_user` (dict).
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = AuthService.get_user(int(get_jwt_identity()))
        if not user:
            # Token válido de uma conta que não existe mais (ex.: conta excluída).
            raise ServiceError("Sessão inválida. Faça login novamente.", 401)
        g.current_user = user
        return fn(*args, **kwargs)

    return wrapper


def monitor_required(fn):
    @wraps(fn)
    @auth_required
    def wrapper(*args, **kwargs):
        if g.current_user["role"] != "monitor":
            raise ServiceError("Apenas monitores podem acessar este recurso.", 403)
        return fn(*args, **kwargs)

    return wrapper
