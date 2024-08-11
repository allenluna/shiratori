"""remove score in user

Revision ID: cacac429e1c3
Revises: f58e95e74cad
Create Date: 2024-08-11 09:43:49.287117

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cacac429e1c3'
down_revision = 'f58e95e74cad'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('score')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('score', sa.INTEGER(), autoincrement=False, nullable=True))

    # ### end Alembic commands ###
