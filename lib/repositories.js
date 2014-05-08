//var mkdirp = require('mkdirp');
var fs = require('fs'),
    path = require('path');
var async = require('async');

var Repository = require('./repository');

function Repositories(config) {
  this._repositories = config.repositories;
  this._rules = config.rules;
  this._cacheDir = config.cacheDir;
}
module.exports = Repositories;

Repositories.prototype.transplant = function(src, dst, rev, callback) {
  if (!this._isAllowed(src, dst)) {
    var msg = 'Transplanting from ' + src + ' to ' + dst + ' is not allowed';
    return process.nextTick(callback.bind(null, new Error(msg)));
  };

  var srcRepo = this.get(src);
  var dstRepo = this.get(dst);

  return async.auto({
    srcRepo: srcRepo.pull.bind(srcRepo),
    dstRepo: dstRepo.pull.bind(dstRepo),
    export: ['srcRepo', function(cb) {
      return srcRepo.export({rev: rev}, cb);
    }],
    import: ['dstRepo', 'export', function(cb, results) {
      var options = {exact: true};
      return dstRepo.import(results.export, options, cb);
    }],
    dstRepoPush: ['import', function(cb) {
      return dstRepo.push(function(err) {
        if (err) return cb(err);
        return cb();
      });
    }]
  }, function(err, results) {
    if (err) return callback(err);
    console.log(results);
    return callback();
  });
};

Repositories.prototype.get = function(name) {
  var remotePath = this._repositories[name];
  if (!remotePath) {
    var msg = 'Unknown repository: ' + name;
    return process.nextTick(callback.bind(null, new Error(msg)));
  }

  var localPath = this._getCachePath(name);

  var config = {
    remotePath: remotePath,
    localPath: localPath
  };
  return new Repository(config);
};

Repositories.prototype._getCachePath = function(name) {
  return path.join(this._cacheDir, name);
};

Repositories.prototype._isAllowed = function(src, dst) {
  for (var i = 0, total = this._rules.length; i < total; i++) {
    var rule = this._rules[i];
    if (rule[0] === src && rule[1] === dst) {
      return true;
    }
  }
  return false;
};
