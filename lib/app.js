var http = require('http');
var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');
var router = require('./router'),
    Repositories = require('./repositories');

module.exports = function(config) {
  var app = express();
  app.http = http.createServer(app);

  app.enable('trust proxy');

  app.use(morgan(config.logger));
  app.use(bodyParser());

  var repositories = new Repositories(config);
  app.use(router(repositories));

  app.start = function(callback) {
    return app.http.listen(config.port, config.host, callback);
  };
  return app;
};
