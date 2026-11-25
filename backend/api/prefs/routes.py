from flask import Blueprint, g, jsonify

from api.auth.guards import auth_required
from api.common import get_json_body

from .services import PrefsService

bp = Blueprint("prefs", __name__, url_prefix="/prefs")


@bp.get("")
@auth_required
def get_prefs():
    response = jsonify(PrefsService.get_prefs(g.current_user["id"]))
    response.headers["Cache-Control"] = "no-store"
    return response


@bp.put("")
@auth_required
def put_prefs():
    response = jsonify(PrefsService.save_prefs(g.current_user["id"], get_json_body()))
    response.headers["Cache-Control"] = "no-store"
    return response


@bp.delete("")
@auth_required
def delete_prefs():
    response = jsonify(PrefsService.reset_prefs(g.current_user["id"]))
    response.headers["Cache-Control"] = "no-store"
    return response
