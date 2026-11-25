from flask import Blueprint, g, jsonify
from flask_jwt_extended import set_access_cookies, unset_jwt_cookies

from api.common import get_json_body

from .guards import auth_required
from .services import AuthService

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.post("/register")
def register():
    user, token = AuthService.register(get_json_body())
    response = jsonify({"user": user})
    set_access_cookies(response, token)  # define access_token_cookie e csrf_access_token
    return response, 201


@bp.post("/login")
def login():
    user, token = AuthService.login(get_json_body())
    response = jsonify({"user": user})
    set_access_cookies(response, token)
    return response


@bp.post("/logout")
def logout():
    response = jsonify({"message": "Sessão encerrada."})
    unset_jwt_cookies(response)
    return response


@bp.get("/me")
@auth_required
def me():
    return jsonify({"user": g.current_user})


@bp.delete("/me")
@auth_required
def delete_me():
    AuthService.delete_account(g.current_user["id"])
    response = jsonify({"message": "Conta e dados removidos."})
    unset_jwt_cookies(response)
    return response
