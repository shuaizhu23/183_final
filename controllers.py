"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import time

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email
from py4web.utils.form import Form, FormStyleBulma

url_signer = URLSigner(session)

# @action('add')
# @action.uses(db, auth, 'add.html')
# def index():
#     return dict(file_upload_url = URL('file_upload', signer=url_signer))

# use py4web to help create form for me
@action('add', method=["GET", "POST"])
@action.uses(db, session, auth.user, 'add.html')
def add():
    # Insert form: no record= in it.
    form = Form(db.task, csrf_session=session, formstyle=FormStyleBulma)
    # custom styling for certain form elements
    # form.structure.find('[name=task_img]')[0]['_class'] = 'type-integer input blue1';
    if form.accepted:
        # We simply redirect; the insertion already happened.
        redirect(URL('index'))

    # Either this is a GET request, or this is a POST but not accepted = with errors.
    return dict(form=form)
    # don't create page as result of form submission

@action('file_upload', method="PUT")
@action.uses() # Add here things you might want to use.
def file_upload():
    file_name = request.params.get("file_name")
    file_type = request.params.get("file_type")
    uploaded_file = request.body # This is a file, you can read it.
    # Diagnostics
    print("Uploaded", file_name, "of type", file_type)
    # print("Content:", uploaded_file.read())
    return "ok"


@action('index')
@action.uses(db, auth.user, 'index.html')
def index():
    r = db(db.auth_user.email == get_user_email()).select().first()
    name = r.first_name + " " + r.last_name if r is not None else "Unknown"
    return dict(
        # This is the signed URL for the callback.
        display_full_name = name,
        user_email = get_user_email(),
        load_tasks_url = URL('load_tasks', signer=url_signer),
        set_task_url = URL('set_task', signer=url_signer),
        file_upload_url = URL('file_upload', signer=url_signer)
    )

# This is our very first API function.
@action('load_contacts')
@action.uses(url_signer.verify(), db)
def load_contacts():
    rows = db(db.contact).select().as_list()
    # print(rows)
    return dict(rows=rows)

@action('load_tasks')
@action.uses(url_signer.verify(), db)
def load_tasks():
    rows = db(db.task).select().as_list()
    return dict(rows=rows)

@action('set_task', method='POST')
# remove auth.user
@action.uses(url_signer.verify(), db)
def set_task():
    id = request.json.get('id')
    task_done = request.json.get('task_done')
    # assert image_id is not None and rating is not None

    # & (db.created_by == get_user())
    db.task.update_or_insert(
        ((db.task.id == id)),
        id=id,
        task_done=task_done
    )
    return "ok" # Just to have some confirmation in the Network tab.
