var express = require('express');
var router = express.Router();
var os = require("os");

router.get('/up', function(req, res, next) {
  var currentTime = new Date();
  var upTime = currentTime - startTime;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ up: true}));
});

// show the system's uptime
router.get('/uptime', function(req, res, next) {
  var currentTime = new Date();
  var upTime = currentTime - startTime;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ status: "Up on " + os.hostname() + " for " + Math.floor(upTime / 1000)}));
});

router.get('/db', function(req, res, next) {
  var stmt = "SELECT count(*) as count FROM sqlite_master WHERE type = 'table' AND name != 'sqlite_sequence'";
  db.each(stmt, function(err, row) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({rowcount: row.count}));
  });
});

module.exports = router;
