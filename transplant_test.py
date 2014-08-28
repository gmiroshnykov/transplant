import os
import unittest
import tempfile
import shutil
import json
import fnmatch
from repository import Repository, MercurialException

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

        self.src = Repository.init(self.src_dir)
        self.dst = Repository.init(self.dst_dir)

        self._set_test_file_content(self.src_dir, "Hello World!\n")
        self.src.commit("Initial commit", addremove=True)
        self.dst.pull(self.src_dir, update=True)

    def configure_app(self):
        transplant.app.config['REPOSITORIES'] = {
            'test-src': self.src_dir,
            'test-dst': self.dst_dir,
        }

        transplant.app.config['RULES'] = {
            'test-src': ['test-dst']
        }

        transplant.app.config['WORKDIR'] = self.workdir

    def tearDown(self):
        print "src_dir: " + self.src_dir
        print "dst_dir: " + self.dst_dir
        print "workdir: " + self.workdir

        if transplant.app.debug:
            print "src_dir: " + self.src_dir
            print "dst_dir: " + self.dst_dir
            print "workdir: " + self.workdir
        else:
            shutil.rmtree(self.src_dir)
            shutil.rmtree(self.dst_dir)
            shutil.rmtree(self.workdir)

    def _set_test_file_content(self, dir, content):
        test_file = os.path.join(dir, 'test.txt')
        with open(test_file, 'w') as f:
            f.write(content)

    def _get_test_file_content(self, dir):
        test_file = os.path.join(dir, 'test.txt')
        with open(test_file, 'r') as f:
            return f.read()

    def test_happy_path(self):
        self._set_test_file_content(self.src_dir, "Goodbye World!\n")
        self.src.commit("Goodbye World!")
        commit = {
            "id": self.src.id(id=True)
        }

        result = self.app.post('/transplant', data=json.dumps({
            'src': 'test-src',
            'dst': 'test-dst',
            'commits': [commit]
        }), content_type='application/json')

        assert result.status_code == 200

        data = json.loads(result.data)
        assert 'tip' in data

        self.dst.update()

        content = self._get_test_file_content(self.dst_dir)
        assert content == "Goodbye World!\n"

    def test_change_messsage(self):
        self._set_test_file_content(self.src_dir, "Goodbye World!\n")
        self.src.commit("Goodbye World!")

        commit = {
            "id": self.src.id(id=True),
            "message": "Goodbye World! a=me"
        }

        result = self.app.post('/transplant', data=json.dumps({
            'src': 'test-src',
            'dst': 'test-dst',
            'commits': [commit]
        }), content_type='application/json')

        assert result.status_code == 200

        data = json.loads(result.data)
        assert 'tip' in data

        self.dst.update()

        content = self._get_test_file_content(self.dst_dir)
        assert content == "Goodbye World!\n"

        commit_info = self.dst.log(rev='tip')[0]

        assert commit_info['message'] == "Goodbye World! a=me"


    def test_error_conflict(self):
        content = "Goodbye World!\n"
        self._set_test_file_content(self.dst_dir, content)
        self.dst.commit("Goodbye World!")

        content = "Hello again!\n"
        self._set_test_file_content(self.src_dir, content)
        self.src.commit("Hello again!")

        commit = {
            "id": self.src.id(id=True)
        }

        result = self.app.post('/transplant', data=json.dumps({
            'src': 'test-src',
            'dst': 'test-dst',
            'commits': [commit]
        }), content_type='application/json')

        assert result.status_code == 409

        data = json.loads(result.data)
        assert data['error'] ==  'Transplant failed'
        assert 'details' in data

        # check that content is not updated
        self.dst.update()

        actual_content = self._get_test_file_content(self.dst_dir)
        assert content != actual_content

        # check that there are no .rej leftovers
        rejects = []
        workdir = os.path.join(self.workdir, 'test-dst')
        for root, dirnames, filenames in os.walk(workdir):
            for filename in fnmatch.filter(filenames, '*.rej'):
                rejects.append(os.path.join(root, filename))

        assert len(rejects) == 0

if __name__ == '__main__':
    unittest.main()
