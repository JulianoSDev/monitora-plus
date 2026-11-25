from flask import Blueprint, g, jsonify, request

from api.auth.guards import auth_required, monitor_required
from api.common import get_json_body

from .services import SlotService

bp = Blueprint("slots", __name__, url_prefix="/slots")


@bp.get("")
@auth_required
def list_slots():
    """Horários futuros. Filtro opcional: ?offering_id=off-ihc"""
    slots = SlotService.list_slots(request.args.get("offering_id"))
    return jsonify({"slots": slots})


@bp.post("")
@monitor_required
def publish_slot():
    slot = SlotService.publish(g.current_user, get_json_body())
    return jsonify({"slot": slot}), 201
