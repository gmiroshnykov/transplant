import os

REPOSITORIES = {
    'transplant-src': 'ssh://hg@bitbucket.org/laggyluke/transplant-src',
    'transplant-dst': 'ssh://hg@bitbucket.org/laggyluke/transplant-dst',
}

RULES = {
    'transplant-src': ['transplant-dst']
}

DEBUG = bool(os.environ.get('TRANSPLANT_DEBUG', '1'))
WORKDIR = os.environ.get('TRANSPLANT_WORKDIR', '/tmp/transplant')
