var config = exports;
config.host = '0.0.0.0';
config.port = 5000;

config.repositories = {
  'transplant-src': 'ssh://hg@bitbucket.org/laggyluke/transplant-src',
  'transplant-dst': 'ssh://hg@bitbucket.org/laggyluke/transplant-dst'
};

// these rules defile the possible transplanting directions
config.rules = [
  ['transplant-src', 'transplant-dst']
];

config.logger = 'dev';
config.cacheDir = '/tmp/transplant';
