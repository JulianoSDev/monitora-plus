"""Support course names and preserve booking history when deleting slots.

Revision ID: 8b26c4d19e02
Revises: 3c416d7c4cd2
"""
from alembic import op
import sqlalchemy as sa

revision = "8b26c4d19e02"
down_revision = "3c416d7c4cd2"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("users", "course", existing_type=sa.String(60), type_=sa.String(80))
    op.add_column("slots", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.drop_constraint("uq_slots_offering_date_start", "slots", type_="unique")
    op.create_index("uq_slots_offering_date_start", "slots",
                    ["offering_id", "date", "start_time"], unique=True,
                    postgresql_where=sa.text("deleted_at IS NULL"))
    # The initial migration omitted the sequence used for booking protocols.
    op.execute("CREATE SEQUENCE IF NOT EXISTS booking_protocol_seq START WITH 1")


def downgrade():
    # Fail rather than truncate names or destroy archived booking history.
    connection = op.get_bind()
    if connection.execute(sa.text("SELECT 1 FROM users WHERE length(course) > 60 LIMIT 1")).first():
        raise RuntimeError("Existem turmas com mais de 60 caracteres; ajuste antes do downgrade.")
    if connection.execute(sa.text("SELECT 1 FROM slots WHERE deleted_at IS NOT NULL LIMIT 1")).first():
        raise RuntimeError("Existem horários excluídos; reconcilie o histórico antes do downgrade.")
    op.drop_index("uq_slots_offering_date_start", table_name="slots")
    op.create_unique_constraint("uq_slots_offering_date_start", "slots",
                                ["offering_id", "date", "start_time"])
    op.drop_column("slots", "deleted_at")
    op.alter_column("users", "course", existing_type=sa.String(80), type_=sa.String(60))
