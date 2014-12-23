import os
import logging

from repository import Repository
from repository import MercurialException

PROJECT_DIR = os.path.dirname(os.path.realpath(__file__))
TRANSPLANT_FILTER = os.path.join(PROJECT_DIR, 'transplant_filter.py')
Repository.register_extension(
    'collapse',
    os.path.join(PROJECT_DIR, 'vendor', 'hgext', 'collapse.py')
)

logger = logging.getLogger('transplant')

class Transplant(object):
    def __init__(self):
        pass

    def transplant(self, src_dir, dst_dir, commits):
        src_repo = Repository(src_dir)
        dst_repo = Repository(dst_dir)

        try:
            for item in items:
                self._transplant_item(src_repo, dst_repo, item)

            logger.info('pushing "%s"', dst_repo.path)
            dst_repo.push()

            tip = dst_repo.id(id=True)
            logger.info('tip: %s', tip)
            return {'tip': tip}

        finally:
            self._cleanup(dst_repo)


    def _transplant_item(self, src_repo, dst_repo, item):
        commit_ids = item.get('commits', None)
        if commit_ids is None:
            commit_id = item.get('commit', None)
            if commit_id is None:
                raise TransplantError('neither "commit" nor "commits" is set')

            commit_ids = [commit_id]

        message = item.get('message', None)

        commits = src_repo.log(rev=commit_ids)
        commits_count = len(commits)

        if commits_count == 0:
            return

        if commits_count == 1:
            self._raw_transplant(src_repo, dst_repo, commits[0]['node'], message)
        else:
            old_tip = dst_repo.id(id=True)
            commit_ids = [commit['node'] for commit in commits]

            self._raw_transplant(src_repo, dst_repo, commit_ids)

            collapse_rev = 'descendants(children({}))'.format(old_tip)
            collapse_commits = dst_repo.log(rev=collapse_rev)

            # less than two commits were transplanted, no need to squash
            if len(collapse_commits) < 2:
                return

            logger.info('collapsing "%s"', collapse_rev)
            last_commit_author = commits[-1].author
            dst_repo.collapse(rev=collapse_rev, message=message, user=last_commit_author)


    def _raw_transplant(self, src_repo, dst_repo, commit_id, message=None):
        logger.info('transplanting "%s" from "%s" to "%s"',
            commit_id, src_repo.path, dst_repo.path)

        filter = None
        env = os.environ.copy()

        if message is not None:
            filter = TRANSPLANT_FILTER
            env['TRANSPLANT_MESSAGE'] = message

        return dst_repo.transplant(commit_id, source=src_repo.path, filter=filter, env=env)


    def _cleanup(self, repo):
        logger.info('cleaning up "%s"', repo.path)
        repo.update(clean=True)
        repo.purge(abort_on_err=True, all=True)

        try:
            repo.strip('outgoing()', no_backup=True)
        except MercurialException, e:
            if 'empty revision set' not in e.stderr:
                raise e


class TransplantError(Exception):
    pass

