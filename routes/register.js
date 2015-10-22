var express = require('express');
var router = express.Router();
var Schema = require('node-schema');
var str = require('string-validator');
var bcrypt = require('bcrypt');

/**
 * POST /
 * Add a new user
 */
router.post('/', function(req, res, next) {
  var userSchema = Schema({
    username: {
      'must have at least 5 characters': str.isLength(5),
      'can only contain numbers and letters': str.matches(/^[a-zA-Z0-9]*$/)
    },
    password: {
      'must have at least 10 characters': str.isLength(10)
    }
  });

  userSchema.validate({
    username: req.body.username,
    password: req.body.password
  }).then(function(errors) {
    if (errors) {
      // return json of error fields
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(errors);
    } else {
      // validation passed; see if they already exist
      db.get("SELECT * FROM users where username = $username", {
        $username: req.body.username
      }, function(err, rows) {
        if (rows === undefined) {
          // add the user
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(500).send(JSON.stringify({
                  hash: "general hash error"
                }));
              } else {
                // create user in db
                db.run("INSERT INTO USERS (username, password, admin) VALUES ($username, $password, $admin)", {
                  $username: req.body.username,
                  $password: hash,
                  $admin: 0
                }, function(err) {
                  if(err){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(400).send(JSON.stringify({
                      register: err
                    }));
                    return;
                  }
                  // you dun gud
                  res.status(201).send();
                });
              }
            });
          });
        } else {
          // already a user by this name
          res.setHeader('Content-Type', 'application/json');
          res.status(409).send(JSON.stringify({
            username: "username is already taken"
          }));
        }
      });
    }
  });
});

module.exports = router;
