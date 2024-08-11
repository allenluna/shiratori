"""remove score

Revision ID: 65bbe108b241
Revises: d91c19584b13
Create Date: 2024-08-11 09:31:55.789126

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '65bbe108b241'
down_revision = 'd91c19584b13'
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
