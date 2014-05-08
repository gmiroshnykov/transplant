var fs = require('fs'),
    path = require('path'),
    child_process = require('child_process'),
    execFile = child_process.execFile,
    spawn = child_process.spawn;
var mkdirp = require('mkdirp');

function Repository(config) {
  this._remotePath = config.remotePath;
  this._localPath = config.localPath;
  this._binary = 'hg';
}
module.exports = Repository;

Repository.prototype.pull = function(callback) {
  var self = this;
  return self._init(function(err, isFresh) {
    if (err) return callback(err);
    if (isFresh) return callback();
    return self._exec(['pull', '--update'], callback);
  });
};

Repository.prototype.push = function(callback) {
  return this._exec(['push'], callback);
};

Repository.prototype._init = function(callback) {
  var self = this;
  return fs.exists(self._localPath, function(exists) {
    if (exists) {
      return callback(null, false);
    }

    return self.clone(function(err) {
      if (err) return callback(err);
      return callback(null, true);
    });
  });
};

Repository.prototype.clone = function(callback) {
  var self = this;
  var dirname = path.dirname(self._localPath);
  return mkdirp(dirname, function(err) {
    if (err) return callback(err);
    var cmd = ['clone', self._remotePath, self._localPath];
    return execFile(self._binary, cmd, function(err, stdout, stderr) {
      // console.log('stdout:', stdout);
      // console.log('stderr:', stderr);
      if (err) return callback(err);
      return callback();
    });
  });
};

Repository.prototype.export = function(options, callback) {
  if (typeof(options) === 'function') {
    callback = options;
    options = {};
  }

  var cmd = ['export'];

  if (options.rev) {
    cmd.push('--rev', options.rev);
  }

  cmd.push('--git');

  return this._exec(cmd, callback);
};

Repository.prototype.import = function(content, options, callback) {
  if (typeof(options) === 'function') {
    callback = options;
    options = {};
  }

  var cmd = ['import'];

  if (options.exact) {
    cmd.push('--exact');
  }

  cmd.push('-');
  var child = this._spawn(cmd);
  child.stdin.write(content);
  child.stdin.end();

  var childOut = childErr = '';
  child.stdout.on('data', function(data) {
    childOut += data;
  });

  child.stderr.on('data', function(data) {
    childErr += data;
  });

  return child.on('close', function(code, signal) {
    if (code !== 0) {
      var msg = 'hg import failed with error code ' + code + "\n";
      msg += 'stdout: ' + childOut + "\n";
      msg += 'stderr: ' + childErr + "\n";
      return callback(new Error(msg));
    }

    return callback();
  });
};

Repository.prototype._exec = function(command, callback) {
  var options = {
    cwd: this._localPath
  };
  return execFile(this._binary, command, options, function(err, stdout, stderr) {
    if (err) {
      // FIXME: I hate Mercurial
      if (command[0] === 'push' && err.code === 1) {
        // hg help push: Returns 0 if push was successful, 1 if nothing to push.
      } else {
        return callback(err);
      }
    }
    stdout = stdout.trim();
    return callback(null, stdout);
  });
};

Repository.prototype._spawn = function(command) {
  var options = {
    cwd: this._localPath
  };
  return spawn(this._binary, command, options);
};
