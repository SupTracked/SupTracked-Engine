/* globals db */
"use strict";
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
  db.all("SELECT * FROM experiences WHERE owner = $owner AND id = $id", {
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
    db.all("SELECT * FROM drugs WHERE owner = $owner AND id = $id", {
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

    db.all("SELECT * FROM consumptions WHERE owner = $owner AND id = $id", {
      $owner: req.supID,
      $id: req.body.id
    }, function(err, consumptions) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          consumption: err
        }));
        return;
      }

      if (consumptions.length === 0) {
        // they don't own that consumption
        res.setHeader('Content-Type', 'application/json');
        res.status(404).send();
        return;
      }

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
 * @apiParam {Number} consumption_id  id of the consumption
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
  db.all("SELECT * FROM consumptions WHERE owner = $owner AND id = $id", {
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
        db.all("SELECT * FROM friends WHERE owner = $owner AND id = $id", {
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
 * @api {get} /friends Get a unique list of friends by name
 * @apiName GetFriendList
 * @apiGroup Consumption
 *
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number}   friendcount number of unique friends
 *  @apiSuccess {Object[]} friends.friend  JSON array for individual friend
 *    @apiSuccess {String}   friends.friend.name  friend's name
 *    @apiSuccess {String}   friends.friend.use_count  number of consumptions the friend is in
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     friends: [
 *        {"name": "John Smith"}
 *        {"name": "Michael Johnson"}
 *     ]
 *
 */
router.get('/friends', function(req, res, next) {
  // get friends
  db.all("SELECT name, sum((SELECT count(*) as count FROM consumptions as C WHERE C.id = F.consumption_id)) as use_count FROM friends F WHERE F.owner = $owner GROUP BY name ORDER BY use_count DESC;", {
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
    res.status(200).send(friends);
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

/**
 * @api {post} /consumption/search Retrieve an array of experiences with consumptions that match the provided criteria
 * @apiName SearchConsumption
 * @apiGroup Consumption
 *
 * @apiSuccess {Object[]} experiences  JSON array of full experiences
 *  @apiSuccess {Number} experiences.id  id of the experience
 *  @apiSuccess {Number} experiences.date  date of the experience
 *  @apiSuccess {Number} experiences.ttime  id of the consumption for which T-0:00 time format is based off
 *  @apiSuccess {String} experiences.title  title of the experience
 *  @apiSuccess {String} experiences.notes  notes for the experience
 *  @apiSuccess {String} experiences.panicmsg  user's panic message for the created experience
 *  @apiSuccess {Number} experiences.rating_id  rating of general experience quality
 *  @apiSuccess {Number} experiences.owner  id of the owner of the experience
 *  @apiSuccess {Object[]} experiences.consumptions  array of consumptions for the experience
 *   @apiSuccess {Number} experiences.consumptions.id  id of the consumption
 *   @apiSuccess {Number} experiences.consumptions.date  Unix timestamp of the date and time of the consumption
 *   @apiSuccess {Number} experiences.consumptions.count  numerical quantity as measured by the drug's unit
 *   @apiSuccess {Number} experiences.consumptions.experience_id  ID of the experience the consumption is part of
 *   @apiSuccess {Object[]} experiences.consumptions.drug  JSON object of drug
 *    @apiSuccess {Number}   experiences.consumptions.drug.id   ID of friend
 *    @apiSuccess {String}   experiences.consumptions.drug.name  name of drug
 *    @apiSuccess {String}   experiences.consumptions.drug.unit  unit of drug
 *   @apiSuccess {Object[]} experiences.consumptions.method  JSON object of method
 *    @apiSuccess {Number}   experiences.consumptions.method.id   ID of method
 *    @apiSuccess {String}   experiences.consumptions.method.name  name of method
 *   @apiSuccess {String} experiences.consumptions.location  location of the consumption
 *   @apiSuccess {Object[]} experiences.consumptions.friends  array of JSON objects for friends associated with this consumption.
 *    @apiSuccess {Number}   experiences.consumptions.friends.id   ID of friend
 *    @apiSuccess {String}   experiences.consumptions.friends.name  name of friend
 *    @apiSuccess {Number}   experiences.consumptions.friends.consumption_id  consumption_id of friend
 *    @apiSuccess {Number}   experiences.consumptions.friends.owner  owner of friend
 *   @apiSuccess {Number} experiences.consumptions.owner  id of the owner of the consumption
 *
 * @apiParam {Number} [startdate]  Unix timestamp of beginning of date range to select
 * @apiParam {Number} [enddate]  Unix timestamp of end of date range to select
 * @apiParam {Number[]} [drug_id]  array of drug ids to search for
 * @apiParam {Number[]} [method_id]  array of method ids to search for
 * @apiParam {String} [location]  string that must be contained in the location field
 * @apiParam {Number} [limit]  only return this number of rows
 * @apiParam {Number} [offset]  offset the returned number of rows by this amount (requires limit)
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "date": 1445543583,
 *       "id": 1,
 *       "notes": null,
 *       "owner": 1,
 *       "panicmsg": null,
 *       "rating_id": null,
 *       "title": "My Title",
 *       "ttime": null,
 *       "consumptions": [{
 *         "id": 1,
 *         "date": "1445648036",
 *         "count": 2,
 *         "experience_id": 1,
 *         "drug": {
 *           "id": 1,
 *           "name": "Aspirin",
 *           "unit": "mg"
 *         },
 *         "method": {
 *           "id": 1,
 *           "name": "oral"
 *         },
 *         "location": "San Juan",
 *         "friends": [{
 *           "id": 1,
 *           "name": "John Smith"
 *         }],
 *         "owner": 1
 *       }]
 *     }]
 *
 * @apiError noResults no experiences or consumptions match the provided criteria
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found Bad Request
 *
 * @apiError needCriteria no experiences match the provided criteria (at least one must be provided)
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "consumption": "at least one field must be provided"
 *     }
 */
router.post('/search', function(req, res, next) {
  // start assembling the query
  var queryData = {};
  var query = "";
  var searchCriteria = [];
  var limitCriteria = "";
  var limitOffset = "";

  if (req.body !== undefined && Object.keys(req.body).length > 0) {
    if ("limit" in req.body) {
      if (parseInt(req.body.limit)) {
        // we have a parseable int
        limitOffset += " LIMIT " + parseInt(req.body.limit);
      }
    }

    if ("offset" in req.body) {
      if (parseInt(req.body.offset)) {
        // we have a parseable int
        limitOffset += " OFFSET " + parseInt(req.body.offset);
      }
    }

    // get date range
    if ("startdate" in req.body && "enddate" in req.body) {
      searchCriteria.push("date BETWEEN $startdate AND $enddate");
      queryData.$startdate = req.body.startdate;
      queryData.$enddate = req.body.enddate;
    }

    // get location
    if ("location" in req.body) {
      searchCriteria.push("location LIKE '%' || $location || '%'");
      queryData.$location = req.body.location;
    }

    // get drug
    if ("drug_id" in req.body) {
      searchCriteria.push("drug_id = $drug_id");
      queryData.$drug_id = req.body.drug_id;
    }

    // get method
    if ("method_id" in req.body) {
      searchCriteria.push("method_id = $method_id");
      queryData.$method_id = req.body.method_id;
    }
  } else {
    // no headers... we need SOMETHING here. use experience search if you don't care
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send({
      consumption: "at least one field must be provided"
    });
    return;
  }

  // slap the limit and offset
  query = "SELECT * FROM consumptions";

  query += " WHERE";

  if (searchCriteria.length > 0) {
    // we know we have search criteria; add it
    query += " " + searchCriteria.join(" AND ");
    query += " AND owner = $owner";
    queryData.$owner = req.supID;
  } else {
    query += " owner = $owner";
    queryData.$owner = req.supID;
  }

  query += " ORDER BY date desc";
  query += limitOffset;

  // get the consumptions
  db.all(query, queryData, function(err, consumptions) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        consumption: err
      }));
      return;
    }

    // no consumptions returned
    if (consumptions.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // get a list of experience ID's we care about
    var experienceIDs = consumptions.map(function(consumption) {
      return consumption.experience_id;
    });

    // get all our experiences
    db.all("SELECT * FROM experiences WHERE id IN (" + experienceIDs.join() + ") ORDER BY id DESC, date DESC",
      function(err, experiences) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            experience: err
          }));
          return;
        }

        var allExperiences = [];

        experiences.forEach(function(singleExperience, experienceIndex) {
          // get consumptions for each experience
          db.all("SELECT *, C.id as cid, D.id as did, M.id as mid, M.name as mname, D.name as dname" +
            " FROM consumptions C LEFT JOIN drugs D ON C.drug_id = D.id LEFT JOIN methods M ON C.method_id = M.id" +
            " WHERE C.experience_id = $id AND c.owner = $owner GROUP BY cid ORDER BY date DESC", {
              $id: singleExperience.id,
              $owner: req.supID
            },
            function(err, consumptions) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({
                  experience: err
                }));
                return;
              }

              // no consumptions returned; push the experience with no consumptions
              if (consumptions.length === 0) {
                singleExperience.consumptions = [];
                allExperiences.push(singleExperience);

                // if we've covered all the experiences, fire it off
                if (experienceIndex === experiences.length - 1) {
                  // bombs away
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).send(allExperiences);
                } else {
                  // we're not done; just return so we can keep processing experiences
                  return;
                }
              }

              // layout where each consumption will go
              var allConsumptions = [];

              consumptions.forEach(function(consumption, index) {
                // set up the drug array
                var drugData = {};
                //only load if we have drugs in this con (though that should never happen)
                if (consumption.drug_id !== undefined) {
                  drugData.id = consumption.drug_id;
                  drugData.name = consumption.cname;
                  drugData.unit = consumption.unit;
                }

                // set up the method array
                var methodData = {};
                //only load if we have methods in this con (though that should never happen)
                if (consumption.method_id !== undefined) {
                  methodData.id = consumption.method_id;
                  methodData.name = consumption.mname;
                }

                // we have a consumption; let's parse the friends into it
                db.all("SELECT * FROM friends WHERE consumption_id = $id AND owner = $owner", {
                  $id: consumption.cid,
                  $owner: req.supID
                }, function(err, friends) {
                  if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(400).send(JSON.stringify({
                      experience: err
                    }));
                    return;
                  }

                  // assemble our consumption
                  var compiledConsumption = {
                    id: consumption.cid,
                    date: consumption.date,
                    count: consumption.count,
                    experience_id: consumption.experience_id,
                    drug: drugData,
                    method: methodData,
                    location: consumption.location,
                    friends: friends,
                    owner: req.supID
                  };

                  // shove it in our big object
                  allConsumptions.push(compiledConsumption);

                  // if we've run through all consumptions, load the experience data
                  if (index === consumptions.length - 1) {
                    var fullExperience = {
                      date: singleExperience.date,
                      id: singleExperience.id,
                      notes: singleExperience.notes,
                      owner: singleExperience.owner,
                      panicmsg: singleExperience.panicmsg,
                      rating_id: singleExperience.rating_id,
                      title: singleExperience.title,
                      ttime: singleExperience.ttime,
                      consumptions: allConsumptions
                    };

                    allExperiences.push(fullExperience);

                    // we've done all the experiences
                    if (experienceIndex === experiences.length - 1) {
                      // bombs away
                      res.setHeader('Content-Type', 'application/json');
                      res.status(200).send(allExperiences);
                    }
                  }
                });
              });
            });
        });
      });
  });
});

/**
 * @api {get} /consumption/locations Get a unique list of all locations used in consumptions owned by the user, ordered from most used to least used
 * @apiName GetAllConsumptionLocations
 * @apiGroup Consumption
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number}   locationcount number of unique locations
 * @apiSuccess {Object[]} locations json array of locations.
 *  @apiSuccess {Object[]} locations.location  JSON array for individual locations
 *    @apiSuccess {String}   locations.location.name  location name
 *    @apiSuccess {String}   locations.location.use_count  number of times that the location has been used in consumptions
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       location: 'Maine',
 *       use_count: 1
 *     }, {
 *       location: 'San Juan',
 *       use_count: 1
 *     }]
 *
 */
router.get('/locations', function(req, res, next) {
  // get locations
  db.all("SELECT location, count(*) as use_count from consumptions WHERE owner = $owner GROUP BY location ORDER BY use_count DESC", {
    $owner: req.supID
  }, function(err, locations) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        location: err
      }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(locations);
  });
});

/**
 * @api {get} /consumption/experience/:id Get a JSON object of all consumptions from a given experience
 * @apiName GetConsumptionsByExp
 * @apiGroup Consumption
 *
 * @apiParam {Number} id  id of the desired experience's consumptions
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Object[]} consumptions  array of JSON objects for consumptions in this experience
 *  @apiSuccess {Number} consumptions.id  id of the consumption
 *  @apiSuccess {Number} consumptions.date  Unix timestamp of the date and time of the consumption
 *  @apiSuccess {Number} consumptions.count  numerical quantity as measured by the drug's unit
 *  @apiSuccess {Number} consumptions.experience_id  ID of the experience the consumption is part of
 *  @apiSuccess {Object[]} consumptions.drug  JSON object of drug
 *    @apiSuccess {Number}   consumptions.drug.id   ID of friend
 *    @apiSuccess {String}   consumptions.drug.name  name of drug
 *    @apiSuccess {String}   consumptions.drug.unit  unit of drug
 *  @apiSuccess {Object[]} consumptions.method  JSON object of method
 *    @apiSuccess {Number}   consumptions.method.id   ID of method
 *    @apiSuccess {String}   consumptions.method.name  name of method
 *  @apiSuccess {String} consumptions.location  location of the consumption
 *  @apiSuccess {Object[]} consumptions.friends  array of JSON objects for friends associated with this consumption.
 *    @apiSuccess {Number}   consumptions.friends.id   ID of friend
 *    @apiSuccess {String}   consumptions.friends.name  name of friend
 *    @apiSuccess {Number}   consumptions.friends.consumption_id  consumption_id of friend
 *    @apiSuccess {Number}   consumptions.friends.owner  owner of friend
 *  @apiSuccess {Number} consumptions.owner  id of the owner of the consumption
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "consumptions": [{
 *         "count": 2,
 *         "date": "1445648036",
 *         "drug": {
 *           "id": 1,
 *           "name": "Aspirin",
 *           "unit": "mg",
 *         },
 *         "experience_id": 1,
 *         "friends": [{
 *           "id": 1,
 *           "name": "John Smith",
 *           "consumption_id": 1,
 *           "owner": 1
 *         }],
 *         "id": 1,
 *         "location": "San Juan",
 *         "method": {
 *           "id": 1,
 *           "name": "oral"
 *         },
 *         "owner": 1
 *       }]
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
router.get('/experience/:id', function(req, res, next) {
  // not enough fields were provided
  if (req.params === {} || isNaN(req.params.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      consumption: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT *, C.id as cid, D.id as did, M.id as mid, M.name as mname, D.name as dname" +
    " FROM consumptions C LEFT JOIN drugs D ON C.drug_id = D.id INNER JOIN methods M ON C.method_id = M.id" +
    " WHERE C.experience_id = $id AND c.owner = $owner ORDER BY date DESC", {
      $id: req.params.id,
      $owner: req.supID
    },
    function(err, consumptions) {
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

      // layout where each consumption will go
      var allConsumptions = [];

      consumptions.forEach(function(consumption) {
        // set up the drug array
        var drugData = {};
        //only load if we have drugs in this con (though that should never happen)
        if (consumption.drug_id !== undefined) {
          drugData.id = consumption.drug_id;
          drugData.name = consumption.dname;
          drugData.unit = consumption.unit;
        }

        // set up the method array
        var methodData = {};
        //only load if we have methods in this con (though that should never happen)
        if (consumption.method_id !== undefined) {
          methodData.id = consumption.method_id;
          methodData.name = consumption.mname;
        }

        // we have a consumption; let's parse the friends into it
        db.all("SELECT * FROM friends WHERE consumption_id = $id AND owner = $owner", {
          $id: consumption.cid,
          $owner: req.supID
        }, function(err, friends) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).send(JSON.stringify({
              consumption: err
            }));
            return;
          }

          // assemble our consumption
          var compiledConsumption = {
            id: consumption.cid,
            date: consumption.date,
            count: consumption.count,
            experience_id: consumption.experience_id,
            drug: drugData,
            method: methodData,
            location: consumption.location,
            friends: friends,
            owner: req.supID
          };

          // shove it in our big object
          allConsumptions.push(compiledConsumption);

          // if we've run through all consumptions, return the consumption
          if (allConsumptions.length === consumptions.length) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(allConsumptions);
          }
        });
      });
    });
});

/**
 * @api {get} /consumption/:id Get a JSON object of a consumption
 * @apiName GetConsumption
 * @apiGroup Consumption
 *
 * @apiParam {Number} id  id of the desired consumption
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the consumption
 * @apiSuccess {Number} date  Unix timestamp of the date and time of the consumption
 * @apiSuccess {Number} count  numerical quantity as measured by the drug's unit
 * @apiSuccess {Number} experience_id  ID of the experience the consumption is part of
 * @apiSuccess {Object[]} drug  JSON object of drug
 *  @apiSuccess {Number}   drug.id   ID of friend
 *  @apiSuccess {String}   drug.name  name of drug
 *  @apiSuccess {String}   drug.unit  unit of drug
 * @apiSuccess {Object[]} method  JSON object of method
 *  @apiSuccess {Number}   method.id   ID of method
 *  @apiSuccess {String}   method.name  name of method
 * @apiSuccess {String} location  location of the consumption
 * @apiSuccess {Object[]} friends  array of JSON objects for friends associated with this consumption.
 *  @apiSuccess {Number}   friends.id   ID of friend
 *  @apiSuccess {String}   friends.name  name of friend
 *  @apiSuccess {Number}   friends.consumption_id  consumption_id of friend
 *  @apiSuccess {Number}   friends.owner  owner of friend
 * @apiSuccess {Number} owner  id of the owner of the consumption
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "id": 3,
 *        "date": 1445543583,
 *        "count": 3,
 *        "experience_id": "1",
 *        "drug": [
 *            "id": 1,
 *            "name": "phenylpiracetam",
 *            "unit": "mg"
 *         ],
 *        "method": [
 *            "id": 1,
 *            "name": "oral",
 *            "consumption_id": 1,
 *            "owner": 1
 *         ],
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
router.get('/:id', function(req, res, next) {
  // not enough fields were provided
  if (req.params === {} || isNaN(req.params.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      consumption: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT *, C.id as cid, D.id as did, M.id as mid, M.name as mname, D.name as dname" +
    " FROM consumptions C LEFT JOIN drugs D ON C.drug_id = D.id LEFT JOIN methods M ON C.method_id = M.id" +
    " WHERE C.experience_id = $id AND c.owner = $owner ORDER BY date DESC", {
      $id: req.params.id,
      $owner: req.supID
    },
    function(err, consumption) {
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

      // set up the drug array
      var drugData = {};
      //only load if we have drugs in this con (though that should never happen)
      if (consumption[0].drug_id !== undefined) {
        drugData.id = consumption[0].drug_id;
        drugData.name = consumption[0].dname;
        drugData.unit = consumption[0].unit;
      }

      // set up the method array
      var methodData = {};
      //only load if we have methods in this con (though that should never happen)
      if (consumption[0].method_id !== undefined) {
        methodData.id = consumption[0].method_id;
        methodData.name = consumption[0].mname;
      }

      // we have a consumption; let's parse the friends into it
      db.all("SELECT * FROM friends WHERE consumption_id = $id AND owner = $owner", {
        $id: consumption[0].cid,
        $owner: req.supID
      }, function(err, friends) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            consumption: err
          }));
          return;
        }

        // assemble our consumption
        var compiledConsumption = {
          id: consumption[0].cid,
          date: consumption[0].date,
          count: consumption[0].count,
          experience_id: consumption[0].experience_id,
          drug: drugData,
          method: methodData,
          location: consumption[0].location,
          friends: friends,
          owner: req.supID
        };

        // return the consumptionn
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(compiledConsumption);
      });
    });
});


module.exports = router;
