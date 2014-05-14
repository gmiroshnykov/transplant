DEBUG = True

REPOSITORIES = {
    'transplant-src': 'ssh://hg@bitbucket.org/laggyluke/transplant-src',
    'transplant-dst': 'ssh://hg@bitbucket.org/laggyluke/transplant-dst',
}

RULES = [
    ['transplant-src', 'transplant-dst']
]

WORKDIR = '/tmp/transplant'
