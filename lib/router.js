var express = require('express');

module.exports = function(repositories) {
  var router = express.Router();

  router.post('/transplant', function(req, res, next) {
    var src = req.body.src;
    if (!src) {
      return res.send(400, 'no src');
    }

    var dst = req.body.dst;
    if (!dst) {
      return res.send(400, 'no dst');
    }

    var rev = req.body.rev;
    if (!rev) {
      return res.send(400, 'no rev');
    }

    return repositories.transplant(src, dst, rev, function(err) {
      if (err) return next(err);
      return res.send();
    });
  });

  return router;
}
