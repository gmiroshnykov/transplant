import os
import time
import fnmatch
import logging
from flask import Flask, request, redirect, jsonify, render_template
from repository import Repository, MercurialException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TRANSPLANT_FILTER = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'transplant_filter.py')
PULL_INTERVAL = 60

app = Flask(__name__)
app.config.from_object('config')

# make sure that WORKDIR exists
if not os.path.exists(app.config['WORKDIR']):
    os.makedirs(app.config['WORKDIR'])



def is_allowed_transplant(src, dst):
    if src not in app.config['RULES']:
        return False

    if dst not in app.config['RULES'][src]:
        return False

    return True

def has_repo(repo):
    return repo in app.config['REPOSITORIES']

def get_repo_url(name):
    return app.config['REPOSITORIES'][name]

def get_repo_dir(name):
    return os.path.join(app.config['WORKDIR'], name)

def clone_or_pull(name, refresh=False):
    repo_url = get_repo_url(name)
    repo_dir = get_repo_dir(name)

    if not os.path.exists(repo_dir):
        logger.info('cloning repository "%s"', name)
        repository = Repository.clone(repo_url, repo_dir)
        set_last_pull_date(name)
    else:
        repository = Repository(repo_dir)

        last_pull_date = get_last_pull_date(name)

        if refresh or last_pull_date < time.time() - PULL_INTERVAL:
            logger.info('pulling repository "%s"', name)
            repository.pull(update=True)
            set_last_pull_date(name)

    return repository

def get_last_pull_date(name):
    repo_dir = get_repo_dir(name)
    last_pull_date_file = os.path.join(repo_dir, '.hg', 'last_pull_date');
    if not os.path.exists(last_pull_date_file):
        return 0.0

    with open(last_pull_date_file, 'r') as f:
        try:
            timestamp = float(f.read())
        except Exception, e:
            logger.exception('could not read last pull date')
            return 0.0

    return timestamp

def set_last_pull_date(name):
    timestamp = time.time()
    repo_dir = get_repo_dir(name)
    last_pull_date_file = os.path.join(repo_dir, '.hg', 'last_pull_date');
    with open(last_pull_date_file, 'w') as f:
        f.write(str(timestamp))

def get_commit_info(repository, commit_id):
    try:
        log = repository.log(rev=commit_id)
        return log[0]
    except MercurialException, e:
        if 'unknown revision' in e.stderr:
            return False

def cleanup(repo):
    logger.info('cleaning up')
    repo.update(clean=True)
    repo.purge(abort_on_err=True, all=True)

    try:
        repo.strip('outgoing()', no_backup=True)
    except MercurialException, e:
        if 'empty revision set' not in e.stderr:
            raise e

def raw_transplant(repository, source, commit_id, message=None):
    filter = None
    env = os.environ.copy()

    if message is not None:
        filter = TRANSPLANT_FILTER
        env['TRANSPLANT_MESSAGE'] = message

    return repository.transplant(commit_id, source=source, filter=filter, env=env)

def do_transplant(src, dst, commits):
    try:
        dst_repo = clone_or_pull(dst, refresh=True)

        try:
            for commit in commits:
                do_transplant_commit(src, dst, commit)

            logger.info('pushing "%s"', dst)
            dst_repo.push()

            tip = dst_repo.id(id=True)
            logger.info('tip: %s', tip)
            return jsonify({'tip': tip})

        finally:
            cleanup(dst_repo)

    except MercurialException, e:
        print e
        return jsonify({
            'error': 'Transplant failed',
            'details': {
                'cmd': e.cmd,
                'returncode': e.returncode,
                'stdout': e.stdout,
                'stderr': e.stderr
            }
        }), 409


def do_transplant_commit(src, dst, commit):
    dst_repo = Repository(get_repo_dir(dst))
    src_url = get_repo_url(src)

    logger.info('transplanting revision "%s" from "%s" to "%s"', commit['id'], src, dst)

    if 'message' not in commit:
        result = raw_transplant(dst_repo, src_url, commit['id'])
    else:
        result = raw_transplant(dst_repo, src_url, commit['id'], message=commit['message'])

    logger.debug('hg transplant: %s', result)

@app.route('/')
def index():
    rules = app.config['RULES']
    return render_template('index.html', rules=rules)

@app.route('/repositories/<repository_id>/commits/<commit_id>')
def show_commit(repository_id, commit_id):
    repository = clone_or_pull(repository_id)
    commit_info = get_commit_info(repository, commit_id)
    if not commit_info:
        return jsonify({
            'error': 'Commit not found',
            'commit': commit_id
        }), 404

    return jsonify(commit_info)

@app.route('/transplant', methods = ['POST'])
def transplant():
    params = request.get_json()
    if not params:
        return jsonify({'error': 'No src'}), 400

    src = params.get('src')
    dst = params.get('dst')
    commits = params.get('commits')

    if not src:
        return jsonify({'error': 'No src'}), 400

    if not dst:
        return jsonify({'error': 'No dst'}), 400

    if not commits:
        return jsonify({'error': 'No commits'}), 400

    if not has_repo(src):
        msg = 'Unknown src repository: {}'.format(src)
        return jsonify({'error': msg}), 400

    if not has_repo(dst):
        msg = 'Unknown dst repository: {}'.format(dst)
        return jsonify({'error': msg}), 400

    if not is_allowed_transplant(src, dst):
        msg = 'Transplant from {} to {} is not allowed'.format(src, dst)
        return jsonify({'error': msg}), 400

    return do_transplant(src, dst, commits)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
