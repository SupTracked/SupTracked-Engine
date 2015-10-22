var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var status = require('./routes/status');
var users = require('./routes/users');

var app = express();

// logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// body parsing goodness
app.use(bodyParser.json());       // to support JSON-encoded bodies

// routing
app.use('/', routes);
app.use('/status', status);
app.use('/users', users);

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

  if(err.status){
    res.status(err.status).send(err);
  } else{
    res.status(500).send(err);
  }
});

module.exports = app;
