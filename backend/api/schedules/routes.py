from flask import Blueprint, g, jsonify, request

from api.auth.guards import auth_required, monitor_required
from api.common import get_json_body

from .services import ScheduleService

bp = Blueprint("schedules", __name__, url_prefix="/schedules")


@bp.get("")
@auth_required
def list_my_schedules():
    """Meus agendamentos. Filtro opcional: ?status=Confirmado|Concluído|Cancelado"""
    items = ScheduleService.list_mine(g.current_user["id"], request.args.get("status"))
    return jsonify({"schedules": items})


@bp.post("")
@auth_required
def create_schedule():
    item = ScheduleService.create(g.current_user, get_json_body())
    return jsonify({"schedule": item}), 201


@bp.get("/monitor")
@monitor_required
def list_monitor_schedules():
    """Painel do monitor. ?scope=active (padrão) ou all"""
    items = ScheduleService.list_for_monitor(g.current_user, request.args.get("scope"))
    return jsonify({"schedules": items})


@bp.patch("/<int:booking_id>/slot")
@auth_required
def reschedule(booking_id: int):
    item = ScheduleService.reschedule(g.current_user, booking_id, get_json_body())
    return jsonify({"schedule": item})


@bp.patch("/<int:booking_id>/status")
@auth_required
def change_status(booking_id: int):
    item = ScheduleService.change_status(g.current_user, booking_id, get_json_body())
    return jsonify({"schedule": item})
