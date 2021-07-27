# This file defines the database models

import datetime
from .common import db, Field, auth
from pydal.validators import *

def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()

db.define_table('task',
  Field('task_title'),
  Field('task_done', 'boolean', default=False),
  Field('created_by'),
  Field('task_img'),
  Field('task_xp', 'integer', default=50),
  )

db.define_table('contact',
    Field('post_content'),
    Field('full_name'),
    Field('liked','boolean'),
    Field('user_email', default=get_user_email)
    )

db.commit()
