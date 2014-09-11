var gulp = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    reactify = require('reactify'),
    es6ify = require('es6ify');

// es6ify.traceurOverrides = {experimental: true};

var paths = {
  build: 'client/build',
  script: __dirname + '/client/src/app.js',
  scripts: __dirname + '/client/src/**/*',
  statics: 'client/static/**/*',
};

function handleErrors(error) {
  console.error('Error:', error.message);
  this.emit('end'); // Keep gulp from hanging on this task
}

function scripts(watch) {
  if (watch) {
    var bundler = watchify(browserify(paths.script, watchify.args));
  } else {
    var bundler = browserify(paths.script);
  }

  bundler.transform(reactify);
  bundler.transform(es6ify.configure(/.jsx?/));

  function rebundle() {
    return bundler.bundle()
      .on('error', handleErrors)
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
