var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

/**
 * POST /
 * Add a new user
 */
router.post('/', function(req, res, next) {
  // validation
  if (req.body === undefined || !("username" in req.body) || !("password" in req.body) || // existence
    req.body.username.length < 5 || req.body.password.length < 10 || // length
    !(/^[a-zA-Z0-9]*$/.test(req.body.username))) { //regex for alphanumeric
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send({
      userpass: "username must be at least five characters and alphanumeric; " +
        "password must be at least ten characters"
    });
    return;
  }

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
              if (err) {
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
});

module.exports = router;
