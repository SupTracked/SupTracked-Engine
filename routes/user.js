/* globals db */
"use strict";
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

/**
 * @api {get} /user Get user data
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {String} username  id of the created experience
 * @apiSuccess {Number} emergcontact  phone number of the user's emergency contact
 * @apiSuccess {Number} phone  phone number of the user
 * @apiSuccess {Number} admin  1 if the user is an administrator, 0 if they are not
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "username": jsmith,
 *       "emergcontact": 5551234567,
 *       "phone": 694165516,
 *       "admin": 1,
 *     }
 *
 */
router.get('/', function(req, res, next) {
  db.all("SELECT * FROM users WHERE id = $id", {
    $id: req.supID
  }, function(err, user) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
      username: req.supUser,
      emergcontact: user[0].emergcontact,
      phone: user[0].phone,
      admin: user[0].admin
    }));
  });
});

/**
 * @api {put} /user Update an experience
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {Number} [emergcontact]  phone number of the user's emergency contct
 * @apiParam {Number} [phone]  phone number for the user
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiError noFields no fields to set were provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "user": "no fields provided"
 *     }
 *
 * @apiError illegalField a field to update was send that is not permitted (must be in above list)
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "user": "custom field requested that is not permitted"
 *     }
 */
router.put('/', function(req, res, next) {
  var permittedFields = ['emergcontact', 'phone'];

  //no fields were provided
  if (Object.keys(req.body).length === 0 || req.body === undefined) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({user: "no fields provided"}));
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
    res.status(400).send(JSON.stringify({user: "custom field requested that is not permitted"}));
    return;
  }
});

/**
 * @api {put} /user/password Update the user's password
 * @apiName UpdateUserPassword
 * @apiGroup User
 *
 * @apiParam {String} password  user's new password
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiError tooShort password too short or not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "password": "password too short or not provided"
 *     }
 *
 * @apiError hashError a general hashing error was encountered
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Server Errror
 *     {
 *       "hash": "general hash error"
 *     }
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
