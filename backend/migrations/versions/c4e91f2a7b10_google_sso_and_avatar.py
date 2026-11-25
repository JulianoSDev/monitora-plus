"""Add Google OAuth subject and profile avatar URL to users.

Revision ID: c4e91f2a7b10
Revises: 8b26c4d19e02
"""
from alembic import op
import sqlalchemy as sa

revision = "c4e91f2a7b10"
down_revision = "8b26c4d19e02"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("google_sub", sa.String(64), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(500), nullable=True))
    op.create_index(
        "uq_users_google_sub",
        "users",
        ["google_sub"],
        unique=True,
        postgresql_where=sa.text("google_sub IS NOT NULL"),
    )


def downgrade():
    op.drop_index("uq_users_google_sub", table_name="users")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "google_sub")
