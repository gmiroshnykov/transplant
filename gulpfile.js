var gulp = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    reactify = require('reactify');

var paths = {
  build: 'client/build',
  script: __dirname + '/client/src/main.js',
  scripts: __dirname + '/client/src/**/*',
  statics: 'client/static/**/*',
};

function handleErrors() {
  console.log(arguments);
  this.emit('end'); // Keep gulp from hanging on this task
}

function scripts(watch) {
  var bundler = browserify({
    entries: [paths.script],
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug: true
  });

  if (watch) {
    bundler = watchify(bundler);
  }

  bundler.transform(reactify);
  function rebundle() {
    var stream = bundler.bundle();
    return stream.on('error', handleErrors)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(paths.build));
  }
  bundler.on('update', function() {
    gutil.log('Browserify: rebundling...');
    rebundle();
  });
  bundler.on('log', function(msg) {
    gutil.log('Browserify: ' + msg);
  });
  return rebundle();
}

gulp.task('statics', function() {
  return gulp.src(paths.statics)
    .pipe(gulp.dest(paths.build))
});

gulp.task('scripts', function() {
  return scripts(false);
});

gulp.task('build', ['statics', 'scripts']);
gulp.task('watch', ['statics'], function() {
  gulp.watch(paths.statics, ['statics']);
  return scripts(true);
});

gulp.task('default', ['watch']);
