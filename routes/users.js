var express = require('express');
var router = express.Router();
var Schema = require('node-schema');
var str = require('string-validator');
var bcrypt = 3; // require('bcrypt');

/**
 * POST /new
 * Add a new user
 */
router.post('/new', function(req, res, next) {
  var userSchema = Schema({
    username: {
      'must have at least 5 characters': str.isLength(5),
      'can only contain numbers and letters': str.matches(/^[a-zA-Z0-9]*$/)
    },
    password: {
      'must have at least 10 characters': str.isLength(5)
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
        if (rows.length != 0) {
          // already a user by this name
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            username: "username is already taken"
          }));
        } else {
          //add the user
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash("my password", salt, function(err, hash) {
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
                });

                // you dun gud
                res.setHeader('Content-Type', 'application/json');
                res.status(201).send();
              }
            });
          });
        }
      });
    }
  });
});

/**
 * PUT /customfields
 * Change user's custom data
 */
router.put('/customfields', function(req, res, next) {
  var permittedFields = ['emergcontact', 'phone', 'daysback', 'favoritecount'];
  console.log(Object.keys(req.body));
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send();
});

module.exports = router;
