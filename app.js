var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var bcrypt = require('bcrypt');

var status = require('./routes/status');
var user = require('./routes/user');
var register = require('./routes/register');
var experience = require('./routes/experience');

var app = express();

// logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// body parsing goodness
app.use(bodyParser.json()); // to support JSON-encoded bodies

// protect routes
app.use('/user', auth);
app.use('/experience', auth);

// route to controllers
app.use('/status', status);
app.use('/user', user);
app.use('/experience', experience);
app.use('/register', register);

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
    res.status(err.status).send(err);
  } else {
    res.status(500).send(err);
  }
});

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

    // we've heard of them; is the password correct?
    bcrypt.compare(user.pass, row.password, function(err, result) {
      if (result) {
        // good to go; add their ID to the request
        req.supID = row.id;
        req.supUser = user.name;
        next();
      } else {
        return unauthorized(res);
      }
    });
  });
}
module.exports = app;
