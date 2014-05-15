import os
import fnmatch
from flask import Flask, request, redirect, jsonify
from hgapi.hgapi import Repo, HgException

app = Flask(__name__)
app.config.from_object('config')
app.config.from_envvar('TRANSPLANT_SETTINGS', silent = True)

def is_allowed_transplant(src, dst):
    for rule in app.config['RULES']:
        if rule == [src, dst]:
            return True
    return False

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
        app.logger.info('cloning repository "%s"', name)
        Repo.hg_clone(repo_url, repo_dir)
    else:
        app.logger.info('pulling repository "%s"', name)
        repo.hg_pull()
        app.logger.info('updating repository "%s"', name)
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

def do_transplant(src, dst, rev):
    try:
        dst_repo = clone_or_pull(dst)
        src_url = get_repo_url(src)

        try:
            app.logger.info('transplanting revision "%s" from "%s" to "%s"', rev, src, dst)
            result = dst_repo.hg_command('--config', 'extensions.transplant=',
                'transplant', '--source', src_url, rev)
            app.logger.debug('hg transplant: %s', result)

            app.logger.info('pushing "%s"', dst)
            safe_push(dst_repo)

            tip = dst_repo.hg_id()
            app.logger.info('tip: %s', tip)
            return jsonify({'tip': tip})

        finally:
            cleanup(dst_repo)

    except HgException, e:
        return jsonify({
            'error': 'Transplant failed',
            'details': str(e)
        }), 409


@app.route('/')
def index():
    return redirect('https://github.com/laggyluke/transplant')

@app.route('/transplant', methods = ['POST'])
def transplant():
    params = request.get_json()
    if not params:
        params = request.form

    src = params.get('src')
    dst = params.get('dst')
    rev = params.get('rev')

    if not src:
        return jsonify({'error': 'No src'}), 400

    if not dst:
        return jsonify({'error': 'No dst'}), 400

    if not rev:
        return jsonify({'error': 'No rev'}), 400

    if not has_repo(src):
        msg = 'Unknown src repository: {}'.format(src)
        return jsonify({'error': msg}), 400

    if not has_repo(dst):
        msg = 'Unknown dst repository: {}'.format(dst)
        return jsonify({'error': msg}), 400

    if not is_allowed_transplant(src, dst):
        msg = 'Transplant from {} to {} is not allowed'.format(src, dst)
        return jsonify({'error': msg}), 400

    return do_transplant(src, dst, rev)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
