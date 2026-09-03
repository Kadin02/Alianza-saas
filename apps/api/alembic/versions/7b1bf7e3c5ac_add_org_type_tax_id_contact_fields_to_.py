"""add org_type, tax_id, contact fields to organizations

Revision ID: 7b1bf7e3c5ac
Revises: dcf10b9dd9e8
Create Date: 2026-09-02 22:28:38.814169

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7b1bf7e3c5ac'
down_revision = 'dcf10b9dd9e8'
branch_labels = None
depends_on = None

org_type_enum = sa.Enum(
    "RESIDENCIAL", "CORPORATIVO", "PARCELAS", "ADMINISTRADORA", name="organizationtype"
)


def upgrade() -> None:
    # En Postgres, a diferencia de SQLite, un tipo Enum nuevo debe crearse
    # explícitamente antes de poder usarlo en un ADD COLUMN. Se usa un DO
    # block en vez de Enum.create(checkfirst=True) porque Railway puede
    # reiniciar el contenedor varias veces si el arranque falla, y dos
    # intentos de esta migración pueden solaparse — checkfirst no es a
    # prueba de esa carrera, pero CREATE TYPE ... EXCEPTION WHEN
    # duplicate_object sí.
    if op.get_bind().dialect.name == "postgresql":
        op.execute(
            """
            DO $$ BEGIN
                CREATE TYPE organizationtype AS ENUM
                    ('RESIDENCIAL', 'CORPORATIVO', 'PARCELAS', 'ADMINISTRADORA');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            """
        )
    op.add_column('organizations', sa.Column('org_type', org_type_enum, nullable=True))
    op.add_column('organizations', sa.Column('tax_id', sa.String(), nullable=True))
    op.add_column('organizations', sa.Column('contact_email', sa.String(), nullable=True))
    op.add_column('organizations', sa.Column('contact_phone', sa.String(), nullable=True))
    op.add_column('organizations', sa.Column('address', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('organizations', 'address')
    op.drop_column('organizations', 'contact_phone')
    op.drop_column('organizations', 'contact_email')
    op.drop_column('organizations', 'tax_id')
    op.drop_column('organizations', 'org_type')
    org_type_enum.drop(op.get_bind(), checkfirst=True)
