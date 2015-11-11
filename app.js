/* globals db */
"use strict";
var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var bcrypt = require('bcrypt');
var cors = require('cors');

// route loading
var status = require('./routes/status');
var register = require('./routes/register');
var user = require('./routes/user');
var experience = require('./routes/experience');
var consumption = require('./routes/consumption');
var drug = require('./routes/drug');
var method = require('./routes/method');
var media = require('./routes/media');
var twilio = require('./routes/twilio');

var app = express();
app.use(cors());

/**
* Basic Auth/DB auth system
*/
function auth(req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.status(401).send();
    return;
  }

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  db.get("SELECT * FROM users where username = $username", {
    $username: user.name
  }, function(err, row) {
    if (row === undefined) {
      // I never knew you
      return unauthorized(res);
    }

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
    req.socket.remoteAddress || req.connection.socket.remoteAddress;

    // we've heard of them; is the password correct?
    bcrypt.compare(user.pass, row.password, function(err, result) {
      if (result) {
        // good to go; add their ID to the request
        req.supID = row.id;
        req.supUser = user.name;

        // make an eudit entry if this isn't a standard user check
        if(req.originalUrl !== '/user'){
          db.run("INSERT INTO audit (date, ip, useragent, action, owner)" +
          " VALUES ($date, $ip, $useragent, $action, $owner)", {
            $date: Math.floor(Date.now() / 1000),
            $ip: ip,
            $useragent: req.headers['user-agent'],
            $action: req.originalUrl,
            $owner: row.id
          });
        }

        next();
      } else {
        // build and insert the audit entry
        db.run("INSERT INTO audit (date, ip, useragent, action, owner)" +
        " VALUES ($date, $ip, $useragent, $action, $owner)", {
          $date: Math.floor(Date.now() / 1000),
          $ip: ip,
          $useragent: req.headers['user-agent'],
          $action: req.originalUrl + '(bad auth)',
          $owner: row.id
        });

        return unauthorized(res);
      }
    });
  });
}

// logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// body parsing goodness
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

// protect routes
app.use('/user', auth);
app.use('/experience', auth);
app.use('/consumption', auth);
app.use('/drug', auth);
app.use('/method', auth);
app.use('/media', auth);

// route to controllers
app.use('/register', register);
app.use('/status', status);
app.use('/user', user);
app.use('/experience', experience);
app.use('/consumption', consumption);
app.use('/drug', drug);
app.use('/method', method);
app.use('/media', media);
app.use('/twilio', twilio);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.status) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(err);
      console.log(err.stack);
    }
    res.status(err.status).send(err);
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.log(err);
      console.log(err.stack);
    }
    res.status(500).send(err);
  }
});


module.exports = app;
