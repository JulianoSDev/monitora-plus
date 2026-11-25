"""Add user preferences JSONB and tracked reset timestamp to users.

Revision ID: d7a4e8c31f09
Revises: c4e91f2a7b10
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "d7a4e8c31f09"
down_revision = "c4e91f2a7b10"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("preferences", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("users", sa.Column("preferences_updated_at", sa.DateTime(timezone=True), nullable=True))


def downgrade():
    op.drop_column("users", "preferences_updated_at")
    op.drop_column("users", "preferences")
