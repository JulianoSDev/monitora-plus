from datetime import date, datetime, time, timedelta

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from api.common import (
    SLOT_DURATION_MINUTES,
    TIME_BANDS,
    WEEKDAY_NAMES,
    ServiceError,
    clean_text,
    now_local,
    transactional,
)
from api.offerings.services import OfferingService
from extensions import db

MAX_DAYS_AHEAD = 365


class SlotService:
    @staticmethod
    def time_fields(slot_date: date, start: time, end: time) -> dict:
        """Campos de data/hora no formato que a API devolve (também usado por schedules)."""
        start_s, end_s = start.strftime("%H:%M"), end.strftime("%H:%M")
        return {
            "date": slot_date.isoformat(),
            "day_name": WEEKDAY_NAMES[slot_date.weekday()],
            "start_time": start_s,
            "end_time": end_s,
            "time": f"{start_s} - {end_s}",
        }

    @staticmethod
    def serialize(row) -> dict:
        capacity = row["capacity"]
        occupied = row["occupied"]
        return {
            "id": row["id"],
            "offering_id": row["offering_id"],
            **SlotService.time_fields(row["date"], row["start_time"], row["end_time"]),
            "capacity": capacity,
            "occupied": occupied,
            "remaining": max(0, capacity - occupied),
        }

    @staticmethod
    def list_slots(offering_id: str | None = None) -> list[dict]:
        """Horários futuros (opcionalmente de uma disciplina), com vagas ocupadas/livres."""
        sql = """
            SELECT s.id, s.offering_id, s.date, s.start_time, s.end_time, s.capacity,
                   (SELECT COUNT(*) FROM bookings b
                    WHERE b.slot_id = s.id AND b.status = 'Confirmado') AS occupied
            FROM slots s
            WHERE (s.date + s.start_time) > :now
        """
        params: dict = {"now": now_local()}
        if offering_id:
            sql += " AND s.offering_id = :off"
            params["off"] = offering_id
        sql += " ORDER BY s.date, s.start_time, s.id"

        rows = db.session.execute(text(sql), params).mappings().all()
        return [SlotService.serialize(r) for r in rows]

    @staticmethod
    @transactional
    def publish(user: dict, data: dict) -> dict:
        """Monitor publica um horário na disciplina à qual está vinculado."""
        date_raw = clean_text(data.get("date"))
        time_raw = clean_text(data.get("time"))
        professor_code = clean_text(data.get("professor_code"))
        capacity_raw = data.get("capacity")

        errors: dict[str, str] = {}

        slot_date = None
        if not date_raw:
            errors["date"] = "Selecione a data do atendimento."
        else:
            try:
                slot_date = date.fromisoformat(date_raw)
            except ValueError:
                errors["date"] = "Data inválida. Use o formato AAAA-MM-DD."

        start = None
        if time_raw not in TIME_BANDS:
            errors["time"] = "Selecione um horário válido: " + ", ".join(TIME_BANDS) + "."
        else:
            start = time.fromisoformat(time_raw.split(" - ")[0])

        capacity = None
        if isinstance(capacity_raw, bool):
            capacity = None
        elif isinstance(capacity_raw, int):
            capacity = capacity_raw
        elif isinstance(capacity_raw, str) and capacity_raw.strip().isdigit():
            capacity = int(capacity_raw.strip())
        if capacity is None or not 1 <= capacity <= 15:
            errors["capacity"] = "Informe um limite entre 1 e 15 vagas."

        if not professor_code:
            errors["professor_code"] = "Informe o código autorizado pelo docente."

        if slot_date and start and "date" not in errors and "time" not in errors:
            now = now_local()
            if slot_date < now.date():
                errors["date"] = "Não é possível publicar horário em data passada."
            elif datetime.combine(slot_date, start) <= now:
                errors["time"] = "Este horário já passou. Escolha outro."
            elif slot_date > now.date() + timedelta(days=MAX_DAYS_AHEAD):
                errors["date"] = "A data está distante demais (máximo de 1 ano)."

        if errors:
            raise ServiceError("Dados inválidos. Corrija os campos destacados.", 422, errors)

        offering = db.session.execute(
            text("SELECT professor_code_hash FROM offerings WHERE id = :id"),
            {"id": user["offering_id"]},
        ).mappings().first()
        if not offering or not OfferingService.check_professor_code(
            offering["professor_code_hash"], professor_code
        ):
            raise ServiceError(
                "Código do professor inválido para esta disciplina.",
                403,
                {"professor_code": "Código do professor inválido para esta disciplina."},
            )

        end = (datetime.combine(slot_date, start) + timedelta(minutes=SLOT_DURATION_MINUTES)).time()
        try:
            row = db.session.execute(
                text(
                    """
                    INSERT INTO slots (offering_id, created_by, date, start_time, end_time, capacity)
                    VALUES (:off, :uid, :d, :st, :et, :cap)
                    RETURNING id, offering_id, date, start_time, end_time, capacity, 0 AS occupied
                    """
                ),
                {
                    "off": user["offering_id"],
                    "uid": user["id"],
                    "d": slot_date,
                    "st": start,
                    "et": end,
                    "cap": capacity,
                },
            ).mappings().one()
        except IntegrityError:
            raise ServiceError(
                "Já existe um horário publicado para esta disciplina neste dia e faixa.",
                409,
                {"time": "Já existe um horário publicado neste dia e faixa."},
            )

        return SlotService.serialize(row)
