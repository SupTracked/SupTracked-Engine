var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

/**
 * GET /
 * Get user's custom data
 */
router.get('/', function(req, res, next) {
  db.get("SELECT * FROM users where id = $id", {
    $id: req.supID
  }, function(err, row) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
      username: req.supUser,
      emergcontact: row.emergcontact,
      phone: row.phone,
      daysback: row.daysback,
      favoritecount: row.favoritecount,
      admin: row.admin
    }));
  });
});

/**
 * PUT /
 * Change user's custom data
 */
router.put('/', function(req, res, next) {
  var permittedFields = ['emergcontact', 'phone', 'daysback', 'favoritecount'];

  //no fields were provided
  if (Object.keys(req.body).length === 0 || req.body === undefined) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      customfields: "no fields provided"
    }));
    return;
  }

  if (Object.keys(req.body).every(function(field) {
      return permittedFields.indexOf(field) >= 0;
    })) {
    // all the keys of the request body (AKA all requested fields) are allowed; let them pass

    // assemble the query
    var columns = Object.keys(req.body).join(', ');
    var updateVals = [];
    var dataArray = {};

    // set the column1 = value1, etc. for the update
    Object.keys(req.body).forEach(function(columnName) {
      updateVals.push(columnName + ' = $' + columnName);
    });

    var query = 'UPDATE USERS SET ' + updateVals.join(', ') + ' WHERE id = ' + req.supID;

    // loop through each key and build the JSON object of bindings for sqlite
    Object.keys(req.body).forEach(function(columnName) {
      dataArray["$" + columnName] = req.body[columnName];
    });

    db.run(query, dataArray, function(err) {
      if(err){
        res.status(500).send();
        return;
      }

      // all done. loaded and ready.
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send();
    });
  } else {
    // they tried to send an unsupported key; kick 'em out
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      customfields: "custom field requested that is not permitted"
    }));
  }
});

/**
 * PUT /password
 * Change user's password
 */
router.put('/password', function(req, res, next) {
  if (req.body === undefined || !("password" in req.body) || req.body.password.length < 10){
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      password: "password too short or not provided"
    }));
    return;
  }

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({
          hash: "general hash error"
        }));
      } else {
        // create user in db
        db.run("UPDATE USERS SET password = $password WHERE id = $id", {
          $password: hash,
          $id: req.supID
        }, function() {
          // you dun gud
          res.status(200).send();
        });
      }
    });
  });
});

module.exports = router;
