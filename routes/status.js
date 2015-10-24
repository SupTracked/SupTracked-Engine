var express = require('express');
var router = express.Router();
var os = require("os");

/**
 * @api {get} /status View system status
 * @apiName GetStatus
 * @apiGroup Status
 *
 * @apiSuccess {String} status  always returns "up"
 * @apiSuccess {String} host  hostname of the server running the API
 * @apiSuccess {Number} uptime  uptime of the script in seconds
 * @apiSuccess {Object[]} database  database information
 * @apiSuccess {String} database.file  location of the sqlite database file
 * @apiSuccess {Boolean} database.online  indicates whether the database is online
 * @apiSuccess {Number} database.tables  count of database tables
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "up",
 *        "host": "yourHostName",
 *        "uptime": 3,
 *        "database": {
 *          "file": "data/db/suptracked.db",
 *          "online": true,
 *          "tables": 4
 *        }
 *     }
 */
router.get('/', function(req, res, next) {
  var currentTime = new Date();
  var upTime = currentTime - startTime;
  var stmt = "SELECT count(*) AS count FROM sqlite_master WHERE type = 'table' AND name != 'sqlite_sequence'";
  db.all(stmt, function(err, tableCountRow) {
    if (err) {
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
        tables: tableCountRow[0].count
      }
    }));
  });
});

/**
 * @api {get} /status/up Check whether the system is up
 * @apiName GetUp
 * @apiGroup Status
 *
 * @apiSuccess {String} status  always returns "up"
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "up",
 *     }
 */
router.get('/up', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    status: "up"
  }));
});

/**
 * @api {get} /status/db View DB status
 * @apiName GetDBStatus
 * @apiGroup Status
 *
 * @apiSuccess {Boolean} online  indicates whether the database is online
 * @apiSuccess {Number} tables  count of database tables
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "online": true,
 *        "tables": 4
 *     }
 */
router.get('/db', function(req, res, next) {
  var stmt = "SELECT count(*) AS count FROM sqlite_master WHERE type = 'table' AND name != 'sqlite_sequence'";
  db.each(stmt, function(err, tableCountRow) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        status: err
      }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      online: db.open,
      tables: tableCountRow.count
    }));
  });
});

module.exports = router;
