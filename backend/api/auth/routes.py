from flask import Blueprint, g, jsonify
from flask_jwt_extended import get_csrf_token, get_jwt, set_access_cookies, unset_jwt_cookies

from api.common import get_json_body

from .guards import auth_required
from .services import AuthService

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.get("/providers")
def providers():
    response = jsonify(AuthService.get_providers_status())
    response.headers["Cache-Control"] = "no-store"
    return response


@bp.post("/google")
def google_login():
    result = AuthService.authenticate_google(get_json_body())
    if result.get("needs_onboarding"):
        response = jsonify(result)
        response.headers["Cache-Control"] = "no-store"
        return response, 200

    user = result["user"]
    token = result["token"]
    response = jsonify({"user": user, "csrf_token": get_csrf_token(token)})
    response.headers["Cache-Control"] = "no-store"
    set_access_cookies(response, token)
    return response, 200


@bp.post("/google/complete")
def google_complete():
    user, token = AuthService.complete_google_registration(get_json_body())
    response = jsonify({"user": user, "csrf_token": get_csrf_token(token)})
    response.headers["Cache-Control"] = "no-store"
    set_access_cookies(response, token)
    return response, 201


@bp.post("/gennera")
def gennera_login():
    user, token = AuthService.authenticate_gennera(get_json_body())
    response = jsonify({"user": user, "csrf_token": get_csrf_token(token)})
    response.headers["Cache-Control"] = "no-store"
    set_access_cookies(response, token)
    return response, 200


@bp.post("/register")
def register():
    user, token = AuthService.register(get_json_body())
    response = jsonify({"user": user, "csrf_token": get_csrf_token(token)})
    response.headers["Cache-Control"] = "no-store"
    set_access_cookies(response, token)  # define access_token_cookie e csrf_access_token
    return response, 201


@bp.post("/login")
def login():
    user, token = AuthService.login(get_json_body())
    response = jsonify({"user": user, "csrf_token": get_csrf_token(token)})
    response.headers["Cache-Control"] = "no-store"
    set_access_cookies(response, token)
    return response


@bp.post("/logout")
@auth_required
def logout():
    response = jsonify({"message": "Sessão encerrada."})
    unset_jwt_cookies(response)
    return response


@bp.get("/me")
@auth_required
def me():
    response = jsonify({"user": g.current_user, "csrf_token": get_jwt()["csrf"]})
    response.headers["Cache-Control"] = "no-store"
    return response


@bp.delete("/me")
@auth_required
def delete_me():
    AuthService.delete_account(g.current_user["id"])
    response = jsonify({"message": "Conta e dados removidos."})
    unset_jwt_cookies(response)
    return response
