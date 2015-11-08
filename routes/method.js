/* globals db */
"use strict";
var express = require('express');
var router = express.Router();

/**
 * @api {post} /method Create a method
 * @apiName CreateMethod
 * @apiGroup Method
 *
 * @apiParam {String} name  name of the method
 * @apiParam {String} icon  data URI for the method icon
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the created method
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 3,
 *     }
 *
 * @apiError missingField a required field was missing
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "method": "name and icon required"
 *     }
 */
router.post('/', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("name" in req.body) || !("icon" in req.body)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      method: "name and icon required"
    }));
    return;
  }

  // stick it in
  db.run("INSERT INTO methods (name, icon, owner)" +
    " VALUES ($name, $icon, $owner)", {
      $name: req.body.name,
      $icon: req.body.icon,
      $owner: req.supID
    },
    function(err) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          method: err
        }));
        return;
      }

      // you dun gud
      res.setHeader('Content-Type', 'application/json');
      res.status(201).send(JSON.stringify({
        id: this.lastID
      }));
    });
});

/**
 * @api {put} /method Update a method
 * @apiName UpdateMethod
 * @apiGroup Method
 *
 * @apiParam {Number} id  id of the method
 * @apiParam {String} [name]  name of the method
 * @apiParam {String} [icon]  data URI for the method icon
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
 *       "method": "no fields provided"
 *     }
 *
 * @apiError illegalField a field to update was send that is not permitted (must be in above list)
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "method": "custom field requested that is not permitted"
 *     }
 */
router.put('/', function(req, res, next) {
  var permittedFields = ['name', 'icon', 'id'];

  //no fields were provided
  if (Object.keys(req.body).length === 0 || req.body === undefined) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      method: "no fields provided"
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

    db.all("SELECT * FROM methods WHERE id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err, methods) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          method: err
        }));
        return;
      }

      // no drugs returned; nothing for that ID
      if (methods.length === 0) {
        res.setHeader('Content-Type', 'application/json');
        res.status(404).send();
        return;
      }

      var query = 'UPDATE method SET ' + updateVals.join(', ') + ' WHERE id = $id AND owner = $owner';
      dataArray.$owner = req.supID;

      // loop through each key and build the JSON object of bindings for sqlite
      Object.keys(req.body).forEach(function(columnName) {
        dataArray["$" + columnName] = req.body[columnName];
      });

      db.run(query, dataArray, function(err) {
        if (err) {
          res.status(500).send();
          return;
        }

        // all done. loaded and ready.
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send();
      });
    });
  } else {
    // they tried to send an unsupported key; kick 'em out
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      method: "custom field requested that is not permitted"
    }));
  }
});

/**
 * @api {delete} /method Delete a method
 * @apiName DeleteMethod
 * @apiGroup Method
 *
 * @apiParam {Number} id  ID of the method
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiError missingID id was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "method": "id must be provided"
 *     }
 *
 * @apiError inUse method is currently used in a consumption; followed by array of full consumptions it's used in
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "method": "drug in use",
 *       "consumptions": [array of consumption objects]
 *     }
 *
 * @apiError noRecords no results found for the given ID
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 */
router.delete('/', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("id" in req.body) || isNaN(req.body.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      method: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM methods WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, method) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        method: err
      }));
      return;
    }

    // no methods returned; nothing for that ID
    if (method.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // makes sure it's not in consumptions
    db.all("SELECT * FROM consumptions WHERE method_id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err, consumptions) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          method: err
        }));
        return;
      }

      if (consumptions.length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          method: "method in use",
          consumptions: consumptions
        }));
        return;
      }

      db.run("DELETE FROM methods WHERE id = $id AND owner = $owner", {
        $id: req.body.id,
        $owner: req.supID
      }, function(err) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            method: err
          }));
          return;
        }

        // deleted the method
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send();
      });
    });
  });
});

/**
 * @api {get} /method/all Get a unique list of all methods owned by the user
 * @apiName GetAllMethods
 * @apiGroup Method
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Object[]} methods json array of methods.
 *  @apiSuccess {Object[]} methods.method  JSON array for individual method
 *    @apiSuccess {Number}   methods.method.id  method id.
 *    @apiSuccess {String}   methods.method.name  method name
 *    @apiSuccess {String}   methods.method.icon  method icon
 *    @apiSuccess {Number}   methods.method.use_count  number of times that the method has been used in consumptions
 *    @apiSuccess {Number}   methods.method.owner  id of the owner of the method
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "id": 1,
 *       "name": "Oral",
 *       "icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
 *       "use_count": 3,
 *       "owner": 1
 *     }, {
 *       "id": 2,
 *       "name": "Bucal",
 *       "icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
 *       "use_count": 1,
 *       "owner": 1
 *     }]
 */
router.get('/all', function(req, res, next) {
  // get drugs
  db.all("SELECT *, (SELECT count(*) as count FROM consumptions as C WHERE C.method_id = M.id) as use_count FROM methods M WHERE M.owner = $owner ORDER BY use_count DESC", {
    $owner: req.supID
  }, function(err, methods) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        method: err
      }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(methods);
  });
});

/**
 * @api {get} /method/:id Get a JSON object of a method
 * @apiName GetMethod
 * @apiGroup Method
 *
 * @apiParam {Number} id  ID of the desired method
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the method
 * @apiSuccess {String} name  name of the method
 * @apiSuccess {String} icon  data URI for the method icon
 * @apiSuccess {String} owner  method owner id
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "id": 1,
 *        "name": "Oral",
 *        "icon": "mg",
 *        "owner": 1,
 *     }
 *
 * @apiError missingID id was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "method": "id must be provided"
 *     }
 *
 * @apiError noRecords no results found for the given ID
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 */
router.get('/:id', function(req, res, next) {
  // not enough fields were provided
  if (req.params === {} || isNaN(req.params.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      method: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM methods WHERE id = $id AND owner = $owner", {
    $id: req.params.id,
    $owner: req.supID
  }, function(err, method) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        method: err
      }));
      return;
    }

    // no methods returned; nothing for that ID
    if (method.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // return the method
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(method[0]));
  });
});

module.exports = router;
