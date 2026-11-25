"""Definição das tabelas.

As consultas da aplicação são feitas em SQL puro (text()) dentro de cada services.py;
estes models existem para descrever o schema (db.create_all()) e como referência.
Os defaults ficam no BANCO (server_default), para que INSERTs em SQL puro também os recebam.
"""

from sqlalchemy.dialects.postgresql import JSONB

from extensions import db


class Offering(db.Model):
    """Disciplina que tem monitoria."""

    __tablename__ = "offerings"

    id = db.Column(db.String(20), primary_key=True)  # ex.: "off-ihc"
    subject = db.Column(db.String(120), nullable=False)
    short_subject = db.Column(db.String(40), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    mode = db.Column(db.String(40), nullable=False)  # "Presencial", "Online" ou "Presencial / Online"
    location = db.Column(db.String(160), nullable=False)
    short_location = db.Column(db.String(80), nullable=False)
    # Hash bcrypt do código do professor (nunca é devolvido pela API).
    professor_code_hash = db.Column(db.String(80), nullable=False)


class User(db.Model):
    """Aluno ou monitor (diferenciados por `role`)."""

    __tablename__ = "users"
    __table_args__ = (
        db.CheckConstraint("role IN ('student', 'monitor')", name="ck_users_role"),
        db.CheckConstraint(
            "(role = 'monitor' AND offering_id IS NOT NULL) OR role = 'student'",
            name="ck_users_monitor_has_offering",
        ),
        db.Index(
            "uq_users_google_sub",
            "google_sub",
            unique=True,
            postgresql_where=db.text("google_sub IS NOT NULL"),
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(10), nullable=False)
    name = db.Column(db.String(70), nullable=False)
    ra = db.Column(db.String(12), nullable=False, unique=True)  # matrícula
    email = db.Column(db.String(120), nullable=False, unique=True)  # sempre em minúsculas
    password_hash = db.Column(db.String(80), nullable=False)
    course = db.Column(db.String(80))  # turma (só aluno)
    offering_id = db.Column(db.String(20), db.ForeignKey("offerings.id"))  # disciplina (só monitor)
    google_sub = db.Column(db.String(64))
    avatar_url = db.Column(db.String(500))
    preferences = db.Column(JSONB)
    preferences_updated_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())


class Slot(db.Model):
    """Horário publicado por um monitor (40 min, com limite de vagas)."""

    __tablename__ = "slots"
    __table_args__ = (
        db.CheckConstraint("capacity BETWEEN 1 AND 15", name="ck_slots_capacity"),
        db.Index(
            "uq_slots_offering_date_start", "offering_id", "date", "start_time",
            unique=True, postgresql_where=db.text("deleted_at IS NULL"),
        ),
        db.Index("ix_slots_offering_date", "offering_id", "date"),
    )

    id = db.Column(db.Integer, primary_key=True)
    offering_id = db.Column(db.String(20), db.ForeignKey("offerings.id"), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    deleted_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())


class Booking(db.Model):
    """Agendamento: um usuário reservando uma vaga em um horário."""

    __tablename__ = "bookings"
    __table_args__ = (
        db.CheckConstraint("status IN ('Confirmado', 'Concluído', 'Cancelado')", name="ck_bookings_status"),
        # Um usuário não pode ter duas reservas CONFIRMADAS no mesmo horário.
        db.Index(
            "uq_bookings_confirmed_user_slot",
            "student_id",
            "slot_id",
            unique=True,
            postgresql_where=db.text("status = 'Confirmado'"),
        ),
        db.Index("ix_bookings_slot_status", "slot_id", "status"),
    )

    id = db.Column(db.Integer, primary_key=True)
    protocol = db.Column(db.String(24), nullable=False, unique=True)  # ex.: "#MON-2026-014"
    student_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey("slots.id", ondelete="RESTRICT"), nullable=False)
    topic = db.Column(db.String(180), nullable=False)
    status = db.Column(db.String(10), nullable=False, server_default="Confirmado")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())


# Sequência usada para gerar o número do protocolo (#MON-AAAA-NNN) sem colisões.
booking_protocol_seq = db.Sequence("booking_protocol_seq", start=1, metadata=db.metadata)

