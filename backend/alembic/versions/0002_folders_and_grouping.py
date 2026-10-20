"""folders table + quiz grouping columns

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-07
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "folders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
    )
    op.add_column("quizzes", sa.Column("folder_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("quizzes", sa.Column("position", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_quizzes_folder_id", "quizzes", "folders",
        ["folder_id"], ["id"], ondelete="CASCADE",
    )
    op.create_index("ix_quizzes_folder_id", "quizzes", ["folder_id"])


def downgrade() -> None:
    op.drop_index("ix_quizzes_folder_id", table_name="quizzes")
    op.drop_constraint("fk_quizzes_folder_id", "quizzes", type_="foreignkey")
    op.drop_column("quizzes", "position")
    op.drop_column("quizzes", "folder_id")
    op.drop_table("folders")
