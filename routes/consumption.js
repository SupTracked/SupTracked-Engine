var express = require('express');
var router = express.Router();

/**
 * @api {post} /consumption Create a consumption
 * @apiName CreateConsumption
 * @apiGroup Consumption
 *
 * @apiParam {Number} date  Unix timestamp of the date and time of the consumption
 * @apiParam {Number} count  numerical quantity as measured by the drug's unit
 * @apiParam {Number} experience_id  ID of the experience the consumption is part of
 * @apiParam {Number} drug_id  ID of the drug consumed
 * @apiParam {Number} method_id  ID of the method used to consume the drug
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the created consumption
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 3,
 *     }
 *
 * @apiError missingField date, count, experience_id, drug_id, and method_id required - one or more was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "date, count, experience_id, drug_id, and method_id required"
 *     }
 *
 * @apiError timestampError timestamp must be positive unix time integer, down to seconds resolution
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "timestamp must be positive unix time integer, down to seconds resolution"
 *     }
 *
 * @apiError invalidExperience the requested experience association doesn't exist or belong to this user
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "the requested experience association doesn't exist or belong to this user"
 *     }
 *
 * @apiError invalidDrug the requested drug association doesn't exist or belong to this user
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "the requested drug association doesn't exist or belong to this user"
 *     }
 *
 * @apiError invalidMethon the requested method association doesn't exist or belong to this user
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "the requested method association doesn't exist or belong to this user"
 *     }
 */
router.post('/', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("date" in req.body) || !("count" in req.body) ||
    !("experience_id" in req.body) || !("drug_id" in req.body) || !("method_id" in req.body)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      consumption: "date, count, experience_id, drug_id, and method_id required"
    }));
    return;
  }

  // check for bad timestamp
  if (req.body.date < 0 || isNaN(req.body.date)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      consumption: "timestamp must be positive unix time integer, down to seconds resolution"
    }));
    return;
  }

  // check for bad experience
  db.all("SELECT * from experiences WHERE owner = $owner AND id = $id", {
    $owner: req.supID,
    $id: req.body.experience_id
  }, function(err, rows) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    if (rows.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: "the requested experience association doesn't exist or belong to this user"
      }));
      res.end();
      return;
    }

    // we have a good experience; check for bad drug
    db.all("SELECT * from drugs WHERE owner = $owner AND id = $id", {
      $owner: req.supID,
      $id: req.body.drug_id
    }, function(err, rows) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          consumption: err
        }));
        return;
      }

      if (rows.length === 0) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          consumption: "the requested drug association doesn't exist or belong to this user"
        }));
        return;
      }

      // we have a good experience and drug; check for bad method
      db.all("SELECT * from methods WHERE owner = $owner AND id = $id", {
        $owner: req.supID,
        $id: req.body.method_id
      }, function(err, rows) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            consumption: err
          }));
          return;
        }

        if (rows.length === 0) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            consumption: "the requested method association doesn't exist or belong to this user"
          }));
          return;
        }

        // phew. we made it. stick it in.
        db.run("INSERT INTO consumptions (date, experience_id, count, drug_id, method_id, owner)" +
          " VALUES ($date, $experience_id, $count, $drug_id, $method_id, $owner)", {
            $date: req.body.date,
            $experience_id: req.body.experience_id,
            $count: req.body.count,
            $drug_id: req.body.drug_id,
            $method_id: req.body.method_id,
            $owner: req.supID
          },
          function(err) {
            if (err) {
              res.setHeader('Content-Type', 'application/json');
              res.status(400).send(JSON.stringify({
                consumption: err
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
    });
  });
});

/**
 * @api {get} /consumption Get a JSON object of a consumption
 * @apiName GetConsumption
 * @apiGroup Consumption
 *
 * @apiParam {Number} id  id of the desired consumption
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the experience
 * @apiSuccess {Number} date  Unix timestamp of the date and time of the consumption
 * @apiSuccess {Number} count  numerical quantity as measured by the drug's unit
 * @apiSuccess {Number} experience_id  ID of the experience the consumption is part of
 * @apiSuccess {Number} drug_id  ID of the drug consumed
 * @apiSuccess {Number} method_id  ID of the method used to consume the drug
 * @apiSuccess {Number} owner  id of the owner of the consumption
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "id": 3,
 *        "date": 1445543583,
 *        "count": 3,
 *        "experience_id": "1",
 *        "drug_id": 4,
 *        "method_id": 1,
 *        "owner": 1
 *     }
 *
 * @apiError missingID id was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "id must be provided"
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
      consumption: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.get("SELECT * FROM consumptions WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, row) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    // no rows returned; nothing for that ID
    if (row === undefined) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // return the experience
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(row));
  });
});

/**
 * @api {get} /consumption/experience Get a JSON object of all consumptions from a given experience
 * @apiName GetConsumptionsByExp
 * @apiGroup Consumption
 *
 * @apiParam {Number} id  id of the desired experience's consumptions
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the experience
 * @apiSuccess {Number} date  Unix timestamp of the date and time of the consumption
 * @apiSuccess {Number} count  numerical quantity as measured by the drug's unit
 * @apiSuccess {Number} experience_id  ID of the experience the consumption is part of
 * @apiSuccess {Number} drug_id  ID of the drug consumed
 * @apiSuccess {Number} method_id  ID of the method used to consume the drug
 * @apiSuccess {Number} owner  id of the owner of the consumption
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "id": 3,
 *        "date": 1445543583,
 *        "count": 3,
 *        "experience_id": "1",
 *        "drug_id": 4,
 *        "method_id": 1,
 *        "owner": 1
 *     }
 *
 * @apiError missingID id was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "experience id must be provided"
 *     }
 *
 * @apiError noRecords no consumptions found for the given experience
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 */
router.get('/experience', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("id" in req.body) || isNaN(req.body.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      consumption: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM consumptions WHERE experience_id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, rows) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    // no rows returned; nothing for that ID
    if (rows === undefined) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // return the experience
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({consumptions: rows}));
  });
});

/**
 * @api {put} /consumption Update a consumption
 * @apiName UpdateConsumption
 * @apiGroup Consumption
 *
 * @apiParam {Number} id  id of the experience
 * @apiParam {Number} [date]  Unix timestamp of the date and time of the consumption
 * @apiParam {Number} [count]  numerical quantity as measured by the drug's unit
 * @apiParam {Number} [experience_id]  ID of the experience the consumption is part of
 * @apiParam {Number} [drug_id]  ID of the drug consumed
 * @apiParam {Number} [method_id]  ID of the method used to consume the drug
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
 *       "consumption": "no fields provided"
 *     }
 *
 * @apiError illegalField a field to update was send that is not permitted (must be in above list)
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "custom field requested that is not permitted"
 *     }
 */
router.put('/', function(req, res, next) {
  var permittedFields = ['date', 'count', 'experience_id', 'drug_id', 'method_id', 'id'];

  //no fields were provided
  if (Object.keys(req.body).length === 0 || req.body === undefined) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      consumption: "no fields provided"
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

    var query = 'UPDATE consumptions SET ' + updateVals.join(', ') + ' WHERE id = $conid AND owner = $owner';
    dataArray.$owner = req.supID;
    dataArray.$conid = req.body.id;

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
      consumption: "custom field requested that is not permitted"
    }));
  }
});

/**
 * @api {delete} /consumption Delete a consumption
 * @apiName DeleteConsumption
 * @apiGroup Consumption
 *
 * @apiParam {Number} id  ID of the experience
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
 *       "experience": "id must be provided"
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
      experience: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.get("SELECT * FROM consumptions WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, row) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    // no rows returned; nothing for that ID
    if (row === undefined) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    db.run("DELETE FROM consumptions WHERE id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err, row) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          consumption: err
        }));
        return;
      }

      // deleted the consumption
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(row));
    });
  });
});

module.exports = router;
