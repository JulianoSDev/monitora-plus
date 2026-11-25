from datetime import datetime

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from api.common import MONITOR_NAMES_SQL, ServiceError, clean_text, now_local, transactional
from api.slots.services import SlotService
from extensions import db

STATUSES = ["Confirmado", "Concluído", "Cancelado"]
TOPIC_MIN, TOPIC_MAX = 4, 180

# Mudanças de status permitidas, por quem faz a ação.
OWNER_TRANSITIONS = {("Confirmado", "Cancelado"), ("Cancelado", "Confirmado")}  # cancelar / desfazer
MONITOR_TRANSITIONS = {("Confirmado", "Concluído"), ("Concluído", "Confirmado")}  # concluir / desfazer
ALL_TRANSITIONS = OWNER_TRANSITIONS | MONITOR_TRANSITIONS

BOOKING_SELECT = f"""
    SELECT b.id, b.protocol, b.status, b.topic, b.created_at,
           s.id AS slot_id, s.date, s.start_time, s.end_time, s.capacity,
           o.id AS offering_id, o.subject, o.short_subject, o.title, o.location, o.short_location,
           {MONITOR_NAMES_SQL} AS monitors,
           u.id AS student_id, u.name AS student_name, u.ra AS student_ra
    FROM bookings b
    JOIN slots s ON s.id = b.slot_id
    JOIN offerings o ON o.id = s.offering_id
    JOIN users u ON u.id = b.student_id
"""


def _to_int(value) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str) and value.strip().isdigit():
        return int(value.strip())
    return None


class ScheduleService:
    # ---------- helpers internos ----------
    @staticmethod
    def _serialize(row, include_student: bool = False) -> dict:
        item = {
            "id": row["id"],
            "protocol": row["protocol"],
            "status": row["status"],
            "topic": row["topic"],
            "created_at": row["created_at"].isoformat(),
            "slot": {
                "id": row["slot_id"],
                **SlotService.time_fields(row["date"], row["start_time"], row["end_time"]),
                "capacity": row["capacity"],
            },
            "offering": {
                "id": row["offering_id"],
                "subject": row["subject"],
                "short_subject": row["short_subject"],
                "title": row["title"],
                "location": row["location"],
                "short_location": row["short_location"],
                "monitors": list(row["monitors"] or []),
            },
        }
        if include_student:
            item["student"] = {"id": row["student_id"], "name": row["student_name"], "ra": row["student_ra"]}
        return item

    @staticmethod
    def _fetch(booking_id: int, include_student: bool = False) -> dict:
        row = db.session.execute(
            text(BOOKING_SELECT + " WHERE b.id = :id"), {"id": booking_id}
        ).mappings().one()
        return ScheduleService._serialize(row, include_student)

    @staticmethod
    def _lock_slot(slot_id: int):
        """Trava a linha do horário até o fim da transação: impede vender a mesma vaga duas vezes."""
        return db.session.execute(
            text(
                """
                SELECT id, offering_id, date, start_time, end_time, capacity
                FROM slots WHERE id = :id FOR UPDATE
                """
            ),
            {"id": slot_id},
        ).mappings().first()

    @staticmethod
    def _occupied(slot_id: int) -> int:
        return db.session.execute(
            text("SELECT COUNT(*) FROM bookings WHERE slot_id = :id AND status = 'Confirmado'"),
            {"id": slot_id},
        ).scalar()

    @staticmethod
    def _has_conflict(user_id: int, slot, ignore_booking_id: int | None = None) -> bool:
        sql = """
            SELECT 1 FROM bookings b JOIN slots s ON s.id = b.slot_id
            WHERE b.student_id = :u AND b.status = 'Confirmado'
              AND s.date = :d AND s.start_time = :t
        """
        params = {"u": user_id, "d": slot["date"], "t": slot["start_time"]}
        if ignore_booking_id is not None:
            sql += " AND b.id <> :ign"
            params["ign"] = ignore_booking_id
        return db.session.execute(text(sql + " LIMIT 1"), params).first() is not None

    @staticmethod
    def _ensure_bookable(
        user_id: int,
        slot,
        ignore_booking_id: int | None = None,
        check_future: bool = True,
        check_conflict: bool = True,
    ) -> None:
        """Regras para ocupar uma vaga. O slot já deve estar travado (FOR UPDATE)."""
        if check_future and datetime.combine(slot["date"], slot["start_time"]) <= now_local():
            raise ServiceError("Este horário já passou. Escolha outro.", 409)

        if ScheduleService._occupied(slot["id"]) >= slot["capacity"]:
            raise ServiceError("As vagas deste horário acabaram de ser preenchidas.", 409)

        if (check_conflict and ScheduleService._has_conflict(user_id, slot, ignore_booking_id)):
            fields = SlotService.time_fields(slot["date"], slot["start_time"], slot["end_time"])
            raise ServiceError(
                f"Você já possui um atendimento confirmado em {fields['day_name']} às {fields['start_time']}.",
                409,
            )

    @staticmethod
    def _validate_topic(topic: str, errors: dict) -> None:
        if len(topic) < TOPIC_MIN:
            errors["topic"] = f"Descreva brevemente sua dúvida (mínimo {TOPIC_MIN} caracteres)."
        elif len(topic) > TOPIC_MAX:
            errors["topic"] = f"A descrição pode ter no máximo {TOPIC_MAX} caracteres."

    # ---------- consultas ----------
    @staticmethod
    def list_mine(user_id: int, status: str | None = None) -> list[dict]:
        if status and status not in STATUSES:
            raise ServiceError("Status inválido.", 422, {"status": "Use: " + ", ".join(STATUSES) + "."})

        sql = BOOKING_SELECT + " WHERE b.student_id = :u"
        params: dict = {"u": user_id}
        if status:
            sql += " AND b.status = :st"
            params["st"] = status
        sql += """
            ORDER BY CASE b.status WHEN 'Confirmado' THEN 0 WHEN 'Concluído' THEN 1 ELSE 2 END,
                     b.created_at DESC, b.id DESC
        """
        rows = db.session.execute(text(sql), params).mappings().all()
        return [ScheduleService._serialize(r) for r in rows]

    @staticmethod
    def list_for_monitor(user: dict, scope: str | None = None) -> list[dict]:
        """Painel do monitor: agendamentos de toda a disciplina dele."""
        scope = scope or "active"
        if scope not in ("active", "all"):
            raise ServiceError("Escopo inválido.", 422, {"scope": "Use 'active' ou 'all'."})

        sql = BOOKING_SELECT + " WHERE s.offering_id = :off"
        if scope == "active":
            sql += " AND b.status = 'Confirmado'"
        sql += " ORDER BY b.created_at DESC, b.id DESC"
        rows = db.session.execute(text(sql), {"off": user["offering_id"]}).mappings().all()
        return [ScheduleService._serialize(r, include_student=True) for r in rows]

    # ---------- ações ----------
    @staticmethod
    @transactional
    def create(user: dict, data: dict) -> dict:
        slot_id = _to_int(data.get("slot_id"))
        topic = clean_text(data.get("topic"))

        errors: dict[str, str] = {}
        if slot_id is None:
            errors["slot_id"] = "Selecione um horário."
        ScheduleService._validate_topic(topic, errors)
        if errors:
            raise ServiceError("Dados inválidos. Corrija os campos destacados.", 422, errors)

        slot = ScheduleService._lock_slot(slot_id)
        if not slot:
            raise ServiceError("Horário não encontrado.", 404)

        ScheduleService._ensure_bookable(user["id"], slot)

        now = now_local()
        seq = db.session.execute(text("SELECT nextval('booking_protocol_seq')")).scalar()
        protocol = f"#MON-{now.year}-{seq:03d}"

        try:
            booking_id = db.session.execute(
                text(
                    """
                    INSERT INTO bookings (protocol, student_id, slot_id, topic)
                    VALUES (:p, :u, :s, :t) RETURNING id
                    """
                ),
                {"p": protocol, "u": user["id"], "s": slot_id, "t": topic},
            ).scalar()
        except IntegrityError:
            raise ServiceError("Você já possui um agendamento confirmado neste horário.", 409)

        return ScheduleService._fetch(booking_id)

    @staticmethod
    @transactional
    def reschedule(user: dict, booking_id: int, data: dict) -> dict:
        """Troca o horário (e, se enviado, o assunto) mantendo o mesmo protocolo."""
        new_slot_id = _to_int(data.get("slot_id"))
        errors: dict[str, str] = {}
        if new_slot_id is None:
            errors["slot_id"] = "Selecione o novo horário."

        topic = None
        if "topic" in data:
            topic = clean_text(data.get("topic"))
            ScheduleService._validate_topic(topic, errors)
        if errors:
            raise ServiceError("Dados inválidos. Corrija os campos destacados.", 422, errors)

        booking = db.session.execute(
            text(
                """
                SELECT b.id, b.status, b.slot_id, b.topic, s.offering_id
                FROM bookings b JOIN slots s ON s.id = b.slot_id
                WHERE b.id = :id AND b.student_id = :u
                FOR UPDATE OF b
                """
            ),
            {"id": booking_id, "u": user["id"]},
        ).mappings().first()
        if not booking:
            raise ServiceError("Agendamento não encontrado.", 404)
        if booking["status"] != "Confirmado":
            raise ServiceError("Só é possível reagendar agendamentos confirmados.", 409)
        if new_slot_id == booking["slot_id"]:
            raise ServiceError(
                "Selecione um horário diferente do atual para reagendar.",
                422,
                {"slot_id": "Selecione um horário diferente do atual."},
            )

        slot = ScheduleService._lock_slot(new_slot_id)
        if not slot:
            raise ServiceError("Horário não encontrado.", 404)
        if slot["offering_id"] != booking["offering_id"]:
            raise ServiceError(
                "O novo horário precisa ser da mesma disciplina.",
                422,
                {"slot_id": "O novo horário precisa ser da mesma disciplina."},
            )

        ScheduleService._ensure_bookable(user["id"], slot, ignore_booking_id=booking_id)

        try:
            db.session.execute(
                text("UPDATE bookings SET slot_id = :s, topic = :t WHERE id = :id"),
                {"s": new_slot_id, "t": topic if topic is not None else booking["topic"], "id": booking_id},
            )
        except IntegrityError:
            raise ServiceError("Você já possui um agendamento confirmado neste horário.", 409)

        return ScheduleService._fetch(booking_id)

    @staticmethod
    @transactional
    def change_status(user: dict, booking_id: int, data: dict) -> dict:
        """Cancelar / desfazer cancelamento (dono) e concluir / desfazer conclusão (monitor da disciplina)."""
        new_status = clean_text(data.get("status"))
        if new_status not in STATUSES:
            raise ServiceError(
                "Status inválido.", 422, {"status": "Use: " + ", ".join(STATUSES) + "."}
            )

        booking = db.session.execute(
            text(
                """
                SELECT b.id, b.status, b.student_id, b.slot_id, s.offering_id
                FROM bookings b JOIN slots s ON s.id = b.slot_id
                WHERE b.id = :id
                FOR UPDATE OF b
                """
            ),
            {"id": booking_id},
        ).mappings().first()

        is_owner = booking is not None and booking["student_id"] == user["id"]
        is_monitor = (
            booking is not None
            and user["role"] == "monitor"
            and user["offering_id"] == booking["offering_id"]
        )
        if not booking or not (is_owner or is_monitor):
            # Mesma resposta para "não existe" e "não é seu", para não revelar agendamentos alheios.
            raise ServiceError("Agendamento não encontrado.", 404)

        current = booking["status"]
        if current == new_status:
            raise ServiceError(f"O agendamento já está como {new_status}.", 409)

        transition = (current, new_status)
        if transition not in ALL_TRANSITIONS:
            raise ServiceError(f"Não é possível mudar de {current} para {new_status}.", 409)

        allowed = set()
        if is_owner:
            allowed |= OWNER_TRANSITIONS
        if is_monitor:
            allowed |= MONITOR_TRANSITIONS
        if transition not in allowed:
            raise ServiceError("Você não tem permissão para esta mudança de status.", 403)

        if new_status == "Confirmado":
            slot = ScheduleService._lock_slot(booking["slot_id"])
            if current == "Cancelado":
                # Desfazer cancelamento = ocupar a vaga de novo: vale todas as regras de um agendamento.
                ScheduleService._ensure_bookable(booking["student_id"], slot, ignore_booking_id=booking_id)
            else:
                # Monitor desfez uma conclusão: só precisa haver vaga (o horário pode já ter passado).
                ScheduleService._ensure_bookable(
                    booking["student_id"], slot, check_future=False, check_conflict=False
                )

        try:
            db.session.execute(
                text("UPDATE bookings SET status = :s WHERE id = :id"), {"s": new_status, "id": booking_id}
            )
        except IntegrityError:
            raise ServiceError("Já existe um agendamento confirmado seu neste horário.", 409)

        return ScheduleService._fetch(booking_id, include_student=is_monitor)
