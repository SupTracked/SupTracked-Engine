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
 * @apiParam {String} location  location of the consumption
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
    !("experience_id" in req.body) || !("drug_id" in req.body) ||
    !("method_id" in req.body) || !("location" in req.body)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      consumption: "date, count, experience_id, drug_id, method_id, and location required"
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
  }, function(err, experiences) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    if (experiences.length === 0) {
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
    }, function(err, drugs) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          consumption: err
        }));
        return;
      }

      if (drugs.length === 0) {
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
      }, function(err, methods) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            consumption: err
          }));
          return;
        }

        if (methods.length === 0) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            consumption: "the requested method association doesn't exist or belong to this user"
          }));
          return;
        }

        // phew. we made it. stick it in.
        db.run("INSERT INTO consumptions (date, experience_id, count, drug_id, method_id, location, owner)" +
          " VALUES ($date, $experience_id, $count, $drug_id, $method_id, $location, $owner)", {
            $date: req.body.date,
            $experience_id: req.body.experience_id,
            $count: req.body.count,
            $drug_id: req.body.drug_id,
            $method_id: req.body.method_id,
            $location: req.body.location,
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
 * @apiSuccess {String} location  location of the consumption
 * @apiSuccess {Object[]} friends  array of JSON objects for friends associated with this consumption.
 *  @apiSuccess {Number}   friends.id   ID of friend
 *  @apiSuccess {String}   friends.name  name of friend
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
 *        "location": "San Juan",
 *        "friends": [
 *            {"name": "John Smith", "id": 321},
 *            {"name": "Frank Johnson", "id": 964}
 *         ],
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
  db.all("SELECT * FROM consumptions WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, consumption) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }


    // no consumptions returned; nothing for that ID
    if (consumption.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }


    // we have a consumption; let's parse the friends into it
    db.all("SELECT * FROM friends WHERE consumption_id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err, friends) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          consumption: err
        }));
        return;
      }

      // default is empty Friends
      consumption[0].friends = [];

      // we have friends for this consumption
      if (friends.length > 0) {
        friends.forEach(function(friend) {
          consumption[0].friends.push({
            "name": friend.name,
            "id": friend.id
          });
        });
      }

      // return the consumptionn
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(consumption[0]));
    });
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
 * @apiSuccess {String} location  location of the consumption
 * @apiSuccess {Object[]} friends  array of JSON objects for friends associated with this consumption.
 *  @apiSuccess {Number}   friends.id   ID of friend
 *  @apiSuccess {String}   friends.name  name of friend
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
 *        "friends": [
 *            {"name": "John Smith", "id": 321},
 *            {"name": "Frank Johnson", "id": 964}
 *         ],
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
  }, function(err, consumptions) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    // no consumptions returned; nothing for that ID
    if (consumptions.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }



    // loop through each consumption
    consumptions.forEach(function(consumption, index) {
      // we have consumptions; let's parse the friends into it
      db.all("SELECT * FROM friends WHERE consumption_id = $id AND owner = $owner", {
        $id: req.body.id,
        $owner: req.supID
      }, function(err, friends) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            consumption: err
          }));
          return;
        }

        // default is empty Friends
        consumptions[index].friends = [];

        // we have friends for this consumption
        if (friends.length > 0) {
          friends.forEach(function(friend) {
            consumptions[index].friends.push({
              "name": friend.name,
              "id": friend.id
            });
          });
        }

        // return the experience if this is our last consumption
        if (index == consumptions.length - 1) {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify({
            consumptions: consumptions
          }));
        }
      });
    });
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
 * @apiParam {String} [location]  location of the consumption
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
  var permittedFields = ['date', 'count', 'experience_id', 'drug_id', 'method_id', 'location', 'id'];

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
 *       "consumption": "id must be provided"
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
      consumption: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM consumptions WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, consumption) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    // no consumptions returned; nothing for that ID
    if (consumption.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    db.run("DELETE FROM consumptions WHERE id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          consumption: err
        }));
        return;
      }

      // deleted the consumption
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send();
    });
  });
});

/**
 * @api {post} /friend Add a friend to a consumption
 * @apiName AddFriendConsumption
 * @apiGroup Consumption
 *
 * @apiParam {Number} id  id of the consumption
 * @apiParam {Number} name  name of the friend
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the friend
 * @apiSuccess {String} consumption_id  id of the consumption the friend is attached to
 * @apiSuccess {String} name  name of the friend
 * @apiSuccess {Number} owner  id of the owner of the experience
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "id": 1,
 *        "consumption_id": q",
 *        "name": "John Smith",
 *        "owner": 1
 *     }
 *
 * @apiError missingField consumption_id and name required - one or more was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "consumption_id and name required"
 *     }
 */
router.post('/friend', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("consumption_id" in req.body) || !("name" in req.body)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      consumption: "consumption_id and name required"
    }));
    return;
  }
  // check for bad experience
  db.all("SELECT * from consumptions WHERE owner = $owner AND id = $id", {
    $owner: req.supID,
    $id: req.body.consumption_id
  }, function(err, consumption) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    if (consumption.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: "the requested experience consumption doesn't exist or belong to this user"
      }));
      res.end();
      return;
    }

    // phew. we made it. stick it in.
    db.run("INSERT INTO friends (consumption_id, name, owner)" +
      " VALUES ($consumption_id, $name, $owner)", {
        $consumption_id: req.body.consumption_id,
        $name: req.body.name,
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

        // made the insert, but sqlite only gives us the lastID of the query, so we gotta look up the full thing
        // strictly don't need the owner, but conservative redundant security makes me comfy
        db.all("SELECT * from friends WHERE owner = $owner AND id = $id", {
          $owner: req.supID,
          $id: this.lastID
        }, function(err, friends) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).send(JSON.stringify({
              consumption: err
            }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.status(201).send(JSON.stringify(friends));
        });
      });
  });
});

/**
 * @api {get} /friend Get a unique list of friends by name
 * @apiName GetFriendList
 * @apiGroup Consumption
 *
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number}   friendcount number of unique friends
 * @apiSuccess {Object[]} friends json array of friends.
 * @apiSuccess {Object[]} friends.friend  JSON array for individual friend
 * @apiSuccess {Number}   friends.friend.id  friend's id.
 * @apiSuccess {String}   friends.friend.name  friend's name.
 * @apiSuccess {Number}   friends.friend.consumption_id  consumption ID association for friend
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     friends: [
 *        {"id": 1, "consumption_id": 7", "name": "John Smith"}
 *        {"id": 2, "consumption_id": 4", "name": "Micahel Johnson"}
 *     ]
 *
 */
router.get('/friend', function(req, res, next) {
  // get friends
  db.all("SELECT * from friends WHERE owner = $owner GROUP BY name", {
    $owner: req.supID
  }, function(err, friends) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
      friendcount: friends.length,
      friends: friends
    }));
  });
});


/**
 * @api {delete} /consumption/friend Delete a friend from a consumption
 * @apiName DeleteFriendConsumption
 * @apiGroup Consumption
 *
 * @apiParam {Number} id  ID of the friend
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
 *       "consumption": "id must be provided"
 *     }
 *
 * @apiError noRecords no results found for the given ID
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 */
router.delete('/friend', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("id" in req.body) || isNaN(req.body.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      consumption: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM friends WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, friends) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    // no friends returned; nothing for that ID
    if (friends.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    db.run("DELETE FROM friends WHERE id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          consumption: err
        }));
        return;
      }

      // deleted the consumption
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send();
    });
  });
});

module.exports = router;
