"""add properties table

Revision ID: ce9158494f8e
Revises: 7b1bf7e3c5ac
Create Date: 2026-09-03 11:31:32.242014

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ce9158494f8e'
down_revision = '7b1bf7e3c5ac'
branch_labels = None
depends_on = None

property_type_enum = sa.Enum('PH', 'CASA', 'LOCAL', name='propertytype')


def upgrade() -> None:
    property_type_enum.create(op.get_bind(), checkfirst=True)
    op.create_table('properties',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('organization_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('type', property_type_enum, nullable=False),
    sa.Column('address', sa.String(), nullable=False),
    sa.Column('max_units', sa.Integer(), nullable=False),
    sa.Column('phone', sa.String(), nullable=True),
    sa.Column('email', sa.String(), nullable=True),
    sa.Column('website', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_properties_id'), 'properties', ['id'], unique=False)
    op.create_index(op.f('ix_properties_organization_id'), 'properties', ['organization_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_properties_organization_id'), table_name='properties')
    op.drop_index(op.f('ix_properties_id'), table_name='properties')
    op.drop_table('properties')
    property_type_enum.drop(op.get_bind(), checkfirst=True)
