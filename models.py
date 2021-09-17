# This file defines the database models

import datetime
from .common import db, Field, auth
from pydal.validators import *

def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_uid():
    return auth.current_user.get('id') if auth.current_user else None


# also called impact and urgency
# Field('task_priority', 'integer', default=2),
# Field('time_priority', 'integer', default=2),
# task_xp is derived from task difficult and other stuff, 2nd prio

# modify model for user account

db.define_table(
  'task',
  Field('task_title'),
  Field('task_done', 'boolean', default=False),
  Field('task_img', 'text', default='img/default_task.png'),
  # hidden from user
  Field('created_by', default=get_uid),

  Field('task_difficulty', 'integer', default=2),
  Field('task_xp', 'integer', default=150),
)

db.define_table(
    'rating',
    Field('task_id', 'reference task'),
    Field('task_difficulty', 'integer', default=2),
    # should store rater name I think
    Field('rater'),
)

# If i leave uid in here it crashes? , default=get_uid
db.define_table(
    'adventurer',
    Field('userid'),
    Field('bpxp', 'integer', default=0),
    Field('rolls', 'integer', default=0),
)

db.task.task_img.readable = db.task.task_img.writable = False
db.task.created_by.readable = db.task.created_by.writable = False
db.task.task_xp.readable = db.task.task_xp.writable = False
db.task.task_done.writable = False

db.commit()
