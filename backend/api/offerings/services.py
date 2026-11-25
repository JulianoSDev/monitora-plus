from sqlalchemy import text

from api.common import MONITOR_NAMES_SQL, SLOT_DURATION_MINUTES, now_local
from extensions import bcrypt, db


class OfferingService:
    @staticmethod
    def list_offerings() -> list[dict]:
        """Disciplinas com monitores cadastrados e total de vagas livres em horários futuros."""
        rows = db.session.execute(
            text(
                f"""
                SELECT o.id, o.subject, o.short_subject, o.title, o.mode, o.location, o.short_location,
                       {MONITOR_NAMES_SQL} AS monitors,
                       CAST(COALESCE((
                           SELECT SUM(GREATEST(
                               s.capacity - (SELECT COUNT(*) FROM bookings b
                                             WHERE b.slot_id = s.id AND b.status = 'Confirmado'), 0))
                           FROM slots s
                           WHERE s.offering_id = o.id AND s.deleted_at IS NULL
                             AND (s.date + s.start_time) > :now
                       ), 0) AS integer) AS remaining_total
                FROM offerings o
                ORDER BY o.subject
                """
            ),
            {"now": now_local()},
        ).mappings().all()

        offerings = []
        for row in rows:
            item = dict(row)
            item["monitors"] = list(item["monitors"] or [])
            item["duration_minutes"] = SLOT_DURATION_MINUTES
            offerings.append(item)
        return offerings

    @staticmethod
    def check_professor_code(code_hash: str, code: str) -> bool:
        """Confere o código do professor (o bcrypt rejeita entradas acima de 72 bytes)."""
        if not code or len(code.encode("utf-8")) > 72:
            return False
        return bcrypt.check_password_hash(code_hash, code.strip().upper())
