from flask import Blueprint, jsonify

from .services import OfferingService

bp = Blueprint("offerings", __name__, url_prefix="/offerings")


@bp.get("")
def list_offerings():
    """Pública: a tela de cadastro precisa listar as disciplinas antes do login."""
    return jsonify({"offerings": OfferingService.list_offerings()})
