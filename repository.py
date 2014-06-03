import os
import subprocess
import pipes
import xml.etree.ElementTree as ET

def mkdirp(fullpath):
    if not os.path.exists(fullpath):
        os.makedirs(fullpath)

class Repository(object):
    cmd = "hg"

    def __init__(self, path):
        self._path = path

    @staticmethod
    def unsafe_command(cmd, **kwargs):
        p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs)
        stdout, stderr = p.communicate()
        return p.returncode, stdout, stderr

    @classmethod
    def command(cls, args, extensions=None, **kwargs):
        cmd = [cls.cmd]
        if extensions is not None:
            for extension in extensions:
                cmd.extend(['--config', 'extensions.{}='.format(extension)])

        cmd.extend(args)
        returncode, stdout, stderr = cls.unsafe_command(cmd, **kwargs)
        if returncode != 0:
            raise MercurialException(cmd, returncode, stdout, stderr)

        return stdout

    @classmethod
    def clone(cls, source, destination):
        mkdirp(destination)
        cls.command(['clone', source, destination])
        return Repository(destination)

    @classmethod
    def init(cls, destination):
        mkdirp(destination)
        cls.command(['init'], cwd=destination)
        return Repository(destination)

    def local_command(self, args, **kwargs):
        return self.command(args, cwd=self._path, **kwargs)

    def id(self, **kwargs):
        cmd = ['id']

        if 'id' in kwargs:
            cmd.append('--id')

        return self.local_command(cmd).strip()

    def pull(self, source=None, update=False):
        cmd = ['pull']

        if update:
            cmd.append('--update')

        if source:
            cmd.append(source)

        self.local_command(cmd)

    def push(self):
        try:
            return self.local_command(['push'])
        except MercurialException, e:
            if e.returncode == 1:
                return e.stdout
            else:
                raise e

    def log(self, **kwargs):
        results = []
        output = self.raw_log(style='xml', **kwargs)

        root = ET.fromstring(output)
        for logentry in root.iter('logentry'):
            node = logentry.get('node')
            date = logentry.find('date').text
            message = logentry.find('msg').text
            result = dict(
                node=node,
                date=date,
                message = message
            )
            results.append(result)
        return results

    def raw_log(self, rev, style, **kwargs):
        cmd = ['log']

        if rev:
            cmd.extend(['--rev', rev])

        if style:
            cmd.extend(['--style', style])

        return self.local_command(cmd, **kwargs)

    def transplant(self, rev, source=None, filter=None, **kwargs):
        cmd = ['transplant']

        if source:
            cmd.extend(['--source', source])

        if filter:
            cmd.extend(['--filter', filter])

        cmd.append(rev)
        return self.local_command(cmd, extensions=['transplant'], **kwargs)

    def commit(self, message, addremove=False):
        cmd = ['commit', '--message', message]

        if addremove:
            cmd.append('--addremove')

        return self.local_command(cmd)

    def update(self, clean=False):
        cmd = ['update']

        if clean:
            cmd.append('--clean')

        return self.local_command(cmd)

    def purge(self, abort_on_err=False, all=False):
        cmd = ['purge']

        if abort_on_err:
            cmd.append('--abort-on-err')

        if all:
            cmd.append('--all')

        return self.local_command(cmd, extensions=['purge'])


    def strip(self, rev, no_backup=False):
        cmd = ['strip', '--rev', rev]

        if no_backup:
            cmd.append('--no-backup')

        return self.local_command(cmd, extensions=['strip'])


class MercurialException(Exception):
    def __init__(self, cmd, returncode, stdout, stderr):
        self.cmd = cmd
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr

    def __str__(self):
        command = ' '.join([pipes.quote(arg) for arg in self.cmd])
        return ("command: {}\n" +
            "returncode: {}\n" +
            "stdout: {}\n" +
            "stderr: {}\n").format(command, self.returncode, self.stdout, self.stderr)

if __name__ == '__main__':
    # cmd = ['env']
    # Repository.command(cmd)
    #repository = Repository.clone("ssh://hg@bitbucket.org/laggyluke/transplant-src", "/tmp/transplant-src")
    #repository = Repository("/tmp/transplant-src")
    repository = Repository.init("/tmp/transplant-src")
    print repository
    #log = repository.log(rev="254bb399a5e7")
    #print log
    #repository.transplant('254bb399a5e7', source="ssh://hg@bitbucket.org/laggyluke/transplant-src")
    #id = repository.id(id=True)
    #print id


