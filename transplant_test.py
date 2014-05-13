import os
import unittest
import tempfile
import shutil
from hgapi.hgapi import Repo, HgException

import transplant

class TransplantTestCase(unittest.TestCase):
    def setUp(self):
        self.prepare_mock_repositories()
        self.configure_app()

        self.app = transplant.app.test_client()

    def prepare_mock_repositories(self):
        self.src_dir = tempfile.mkdtemp()
        self.dst_dir = tempfile.mkdtemp()
        self.workdir = tempfile.mkdtemp()

        self.src = Repo(self.src_dir)
        self.dst = Repo(self.dst_dir)

        self.src.hg_init()
        self.dst.hg_init()

        self.set_test_file_content(self.src_dir, "Hello World!")
        self.src.hg_addremove()
        self.src.hg_commit("Initial commit")
        self.dst.hg_pull(self.src_dir)
        self.dst.hg_update('tip')

    def configure_app(self):
        transplant.app.debug = True

        transplant.app.config['REPOSITORIES'] = {
            'test-src': self.src_dir,
            'test-dst': self.dst_dir,
        }

        transplant.app.config['RULES'] = [
            ['test-src', 'test-dst']
        ]

        transplant.app.config['WORKDIR'] = self.workdir

    def tearDown(self):
        if transplant.app.debug:
            print "src_dir: " + self.src_dir
            print "dst_dir: " + self.dst_dir
            print "workdir: " + self.workdir
        else:
            shutil.rmtree(self.src_dir)
            shutil.rmtree(self.dst_dir)
            shutil.rmtree(self.workdir)

    def set_test_file_content(self, dir, content):
        test_file = os.path.join(dir, 'test.txt')
        with open(test_file, 'w') as f:
            f.write(content)

    def get_test_file_content(self, dir):
        test_file = os.path.join(dir, 'test.txt')
        with open(test_file, 'r') as f:
            return f.read()

    def test_happy_path(self):
        self.set_test_file_content(self.src_dir, "Goodbye World!")
        self.src.hg_commit("Goodbye World!")
        rev = self.src.hg_id()

        result = self.app.post('/transplant', data=dict(
            src='test-src',
            dst='test-dst',
            rev=rev
        ))

        assert result.status_code == 200
        assert 'tip' in result.data

        self.dst.hg_update('tip')

        content = self.get_test_file_content(self.dst_dir)
        assert content == "Goodbye World!"


if __name__ == '__main__':
    unittest.main()
