import os
import fnmatch
import logging
from flask import Flask, request, redirect, jsonify, render_template
from hgapi.hgapi import Repo, HgException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TRANSPLANT_FILTER = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'transplant_filter.py')

app = Flask(__name__)
app.config.from_object('config')

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

def clone_or_pull(name):
    # make sure that WORKDIR exists
    mkdirp(app.config['WORKDIR'])

    repo_url = get_repo_url(name)
    repo_dir = get_repo_dir(name)
    repo = Repo(repo_dir)
    if not os.path.exists(repo_dir):
        logger.info('cloning repository "%s"', name)
        Repo.hg_clone(repo_url, repo_dir)
    else:
        logger.info('pulling repository "%s"', name)
        repo.hg_pull()
        logger.info('updating repository "%s"', name)
        repo.hg_update('.')

    return repo

def cleanup(repo):
    repo.hg_update('.', clean=True)

    repo.hg_command('--config', 'extensions.purge=',
        'purge', '--abort-on-err', '--all')

    try:
        repo.hg_command('strip', '--no-backup', 'outgoing()')
    except HgException, e:
        if 'empty revision set' not in str(e):
            raise e

def safe_push(repo, *args):
    result = None
    try:
        result = repo.hg_push(*args)
    except HgException, e:
        if e.exit_code != 1:
            raise e
    return result

def mkdirp(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def amend(repo, message):
    phase = get_phase(repo)
    if phase == 'public':
        logger.info('force-changing current commit phase to "draft"')
        repo.hg_command('phase', '--draft', '--force', 'tip')

    logger.info('rewriting commit message')
    repo.hg_command('commit', '--amend', '--message', message);

def get_phase(repo, rev='tip'):
    return repo.hg_log(rev, template="{phase}")

def do_transplant(src, dst, commit, message=None):
    try:
        dst_repo = clone_or_pull(dst)
        src_url = get_repo_url(src)

        try:
            cmd = ['--config', 'extensions.transplant=',
                'transplant','--source', src_url]

            if message is not None:
                dst_repo._env['TRANSPLANT_MESSAGE'] = message
                cmd.extend(['--filter', TRANSPLANT_FILTER])

            cmd.append(commit)

            logger.info('transplanting revision "%s" from "%s" to "%s"', commit, src, dst)
            logger.debug('command: %s', cmd)
            result = dst_repo.hg_command(*cmd)
            logger.debug('hg transplant: %s', result)

            logger.info('pushing "%s"', dst)
            safe_push(dst_repo)

            tip = dst_repo.hg_id()
            logger.info('tip: %s', tip)
            return jsonify({'tip': tip})

        finally:
            if 'TRANSPLANT_MESSAGE' in dst_repo._env:
                del dst_repo._env['TRANSPLANT_MESSAGE']

            cleanup(dst_repo)

    except HgException, e:
        return jsonify({
            'error': 'Transplant failed',
            'details': str(e)
        }), 409


@app.route('/')
def index():
    rules = app.config['RULES']
    return render_template('index.html', rules=rules)

@app.route('/transplant', methods = ['POST'])
def transplant():
    params = request.get_json()
    if not params:
        params = request.form

    src = params.get('src')
    dst = params.get('dst')
    commit = params.get('commit')
    message = params.get('message')

    if not src:
        return jsonify({'error': 'No src'}), 400

    if not dst:
        return jsonify({'error': 'No dst'}), 400

    if not commit:
        return jsonify({'error': 'No commit'}), 400

    if not has_repo(src):
        msg = 'Unknown src repository: {}'.format(src)
        return jsonify({'error': msg}), 400

    if not has_repo(dst):
        msg = 'Unknown dst repository: {}'.format(dst)
        return jsonify({'error': msg}), 400

    if not is_allowed_transplant(src, dst):
        msg = 'Transplant from {} to {} is not allowed'.format(src, dst)
        return jsonify({'error': msg}), 400

    return do_transplant(src, dst, commit, message=message)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
