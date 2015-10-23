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
 * @api {get} /method Get a JSON object of a method
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
router.get('/', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("id" in req.body) || isNaN(req.body.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      method: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.get("SELECT * FROM methods WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, row) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        method: err
      }));
      return;
    }

    // no rows returned; nothing for that ID
    if (row == []) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // return the method
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(row));
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
  var permittedFields = ['name', 'data'];

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
  } else {
    // they tried to send an unsupported key; kick 'em out
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      method: "custom field requested that is not permitted"
    }));
  }
});

module.exports = router;
