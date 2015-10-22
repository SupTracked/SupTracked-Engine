var express = require('express');
var router = express.Router();
var os = require("os");

router.get('/', function(req, res, next) {
  var currentTime = new Date();
  var upTime = currentTime - startTime;
  var stmt = "SELECT count(*) as count FROM sqlite_master WHERE type = 'table' AND name != 'sqlite_sequence'";
  db.get(stmt, function(err, row) {
    if(err){
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        status: err
      }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      status: "up",
      host: os.hostname(),
      uptime: Math.floor(upTime / 1000),
      database: {
        file: db.filename,
        online: db.open,
        tables: row.count
      }
    }));
  });
});

router.get('/up', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    status: "up"
  }));
});

router.get('/db', function(req, res, next) {
  var stmt = "SELECT count(*) as count FROM sqlite_master WHERE type = 'table' AND name != 'sqlite_sequence'";
  db.each(stmt, function(err, row) {
    if(err){
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        status: err
      }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      online: db.open,
      tables: row.count
    }));
  });
});

module.exports = router;
