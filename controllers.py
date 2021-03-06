import time

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email
from .models import get_uid
from py4web.utils.form import Form, FormStyleBulma

url_signer = URLSigner(session)

# use py4web to help create form for me
@action('add', method=["GET", "POST"])
@action.uses(db, session, auth.user, 'add.html')
def add():
    # Insert form: no record= in it.
    form = Form(db.task, csrf_session=session, formstyle=FormStyleBulma)
    # !!get id of insert?

    # custom styling for certain form elements
    # form.structure.find('[name=task_img]')[0]['_class'] = 'type-integer input blue1';

    if form.accepted:
        # We simply redirect; the insertion already happened.
        redirect(URL('index'))

    # Either this is a GET request, or this is a POST but not accepted = with errors.
    return dict(form=form)
    # don't create page as result of form submission

@action('index')
@action.uses(db, auth.user, 'index.html')
def index():
    return dict(
        view_task_id = get_uid(),
        own_page = "true",
        load_tasks_url = URL('load_tasks', signer=url_signer),
        delete_task_url = URL('delete_task', signer=url_signer),
        set_task_url = URL('set_task', signer=url_signer),
        set_difficulty_url = URL('set_difficulty', signer=url_signer),
        get_diff_raters_url = URL('get_diff_raters', signer=url_signer),
        upload_thumbnail_url = URL('upload_thumbnail', signer=url_signer),
        edit_task_title_url = URL('edit_task_title', signer=url_signer),
    )

@action('index/<id:int>')
@action.uses(db, auth.user, 'index.html')
def index(id=id):
    return dict(
        # This is the signed URL for the callback.
        view_task_id = id,
        own_page = "false",
        load_tasks_url = URL('load_tasks', signer=url_signer),
        delete_task_url = URL('delete_task', signer=url_signer),
        set_task_url = URL('set_task', signer=url_signer),
        set_difficulty_url = URL('set_difficulty', signer=url_signer),
        get_diff_raters_url = URL('get_diff_raters', signer=url_signer),
        upload_thumbnail_url = URL('upload_thumbnail', signer=url_signer),
        edit_task_title_url = URL('edit_task_title', signer=url_signer),
    )

@action('upload_thumbnail', method="POST")
@action.uses(url_signer.verify(), db)
def upload_thumbnail():
    task_id = request.json.get("task_id")
    thumbnail = request.json.get("thumbnail")
    db(db.task.id == task_id).update(task_img=thumbnail)
    return "ok"

@action('load_tasks')
@action.uses(url_signer.verify(), auth.user, db)
def load_tasks():
    person = db(db.auth_user.email == get_user_email()).select().first()
    userid = person.id
    bpxp = 0

    adventurer = db(db.adventurer.userid == userid).select().first()
    if (adventurer is None):
        full_name = person.first_name + " " + person.last_name
        # print("adding adventurer ", full_name)

        db.adventurer.update_or_insert(
            ((db.adventurer.userid == userid)),
            userid=userid,
            full_name=full_name
        )
    else:
        bpxp = adventurer.bpxp
    rows = db(db.task.created_by == request.params.get("id")).select().as_list()
    return dict(rows=rows,bpxp=bpxp)

@action('delete_task')
@action.uses(url_signer.verify(), db)
def delete_contact():
    id = request.params.get('id')
    # assert id is not None
    db(db.task.id == id).delete()
    return "ok"

@action('set_task', method='POST')
@action.uses(url_signer.verify(), db)
def set_task():
    id = request.json.get('id')
    task_done = request.json.get('task_done')
    bpchange = request.json.get('bpchange')

    userid = get_uid()
    db(db.adventurer.userid == userid).update(bpxp=bpchange)

    db.task.update_or_insert(
        ((db.task.id == id)),
        id=id,
        task_done=task_done
    )
    return "ok" # Just to have some confirmation in the Network tab.

@action('get_diff_raters')
@action.uses(url_signer.verify(), db)
def get_diff_raters():
    id = request.params.get('id')
    vid = request.params.get('vid')
    raters = ""

    # couldn't modify py4web form so modify on first check
    row = db(db.rating.task_id == id).select().first()
    base = db(db.task.id == id).select().first()

    if (row is None):
        person = db(db.auth_user.email == get_user_email()).select().first()
        full_name = person.first_name + " " + person.last_name
        # print(full_name)
        db.rating.update_or_insert(
            ((db.rating.id == id)),
            task_id=id,
            task_difficulty=base.task_difficulty,
            rater=full_name
        )
        # generate string here
        raters += full_name
        task_difficulty = base.task_difficulty
    else:
        task_difficulty = base.task_difficulty
        rater_list = db(db.rating.task_id == id).select().as_list()
        for r in rater_list:
            raters += r['rater'] + ", "

        raters = raters[:-2]
    # print(raters)
    # if row is not None else 0
    return dict(task_difficulty=task_difficulty, raters=raters)

@action('set_difficulty', method='POST')
@action.uses(url_signer.verify(), db, auth.user)
def set_difficulty():
    id = request.json.get('id')
    task_difficulty = request.json.get('task_difficulty')

    userid = get_uid()
    adventurer = db(db.adventurer.userid == userid).select().first()
    full_name = adventurer.full_name

    rater_list = db((db.rating.task_id == id) & (db.rating.rater != full_name)).select().as_list()
    totalrating = 0;
    for r in rater_list:
        totalrating += r['task_difficulty']
    totalrating += task_difficulty
    # algorithim to determine final rating
    combined_rating = totalrating//(len(rater_list) + 1)
    # print(combined_rating)

    first_rating = db.rating.update_or_insert(
        ((db.rating.task_id == id) & (db.rating.rater == full_name)),
        task_id=id,
        task_difficulty=task_difficulty,
        rater=full_name
    )
    print(first_rating)
    db(db.task.id == id).update(task_difficulty=combined_rating)

    # throw rater a bone

    status = None;
    base = db(db.task.id == id).select().first()
    if ((base.created_by != adventurer.userid) and (first_rating)):
        db(db.adventurer.userid == userid).update(bpxp=(adventurer.bpxp+5))
        status= "true"

    return dict(status=status,rating=combined_rating)

@action('edit_task_title', method="POST")
@action.uses(url_signer.verify(), db)
def edit_task_title():
    id = request.json.get('id')
    value = request.json.get('value')
    db(db.task.id == id).update(task_title = value)
    time.sleep(1)
    return "ok"
