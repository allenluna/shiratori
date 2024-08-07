"""Initial migration

Revision ID: cbd255cd1e00
Revises: 
Create Date: 2024-08-05 15:04:51.388423

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cbd255cd1e00'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('turn', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('answer', sa.JSON(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('answer')
        batch_op.drop_column('turn')

    # ### end Alembic commands ###
