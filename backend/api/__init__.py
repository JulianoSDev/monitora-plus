from flask import Blueprint, jsonify
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from extensions import db

from .auth.routes import bp as auth_bp
from .offerings.routes import bp as offerings_bp
from .prefs.routes import bp as prefs_bp
from .schedules.routes import bp as schedules_bp
from .slots.routes import bp as slots_bp

# Blueprint pai: a app factory registra só este; ele registra as filhas.
api_bp = Blueprint("api", __name__, url_prefix="/api")

api_bp.register_blueprint(auth_bp)
api_bp.register_blueprint(offerings_bp)
api_bp.register_blueprint(prefs_bp)
api_bp.register_blueprint(slots_bp)
api_bp.register_blueprint(schedules_bp)


@api_bp.get("/health")
def health():
    try:
        db.session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"status": "unavailable"}), 503
    return jsonify({"status": "ok"})
