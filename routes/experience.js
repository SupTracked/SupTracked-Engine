var express = require('express');
var router = express.Router();

/**
 * @api {post} /experience Create an experience
 * @apiName CreateExperience
 * @apiGroup Experience
 *
 * @apiParam {String} title  Title of the new experience
 * @apiParam {Number} date  Unix timestamp of the date and time of the experience
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the created experience
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 3,
 *     }
 *
 * @apiError missingField title and valid date required - one or more was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "experience": "title and valid date required"
 *     }
 *
 * @apiError timestampError timestamp must be positive unix time integer, down to seconds resolution
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "experience": "timestamp must be positive unix time integer, down to seconds resolution"
 *     }
 */
router.post('/', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("title" in req.body) || !("date" in req.body)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      experience: "title and valid date required"
    }));
    return;
  }

  // check for bad timestamp
  if (req.body.date < 0 || isNaN(req.body.date)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      experience: "timestamp must be positive unix time integer, down to seconds resolution"
    }));
    return;
  }

  // stick it in
  db.run("INSERT INTO experiences (title, date, owner) VALUES ($title, $date, $owner)", {
    $title: req.body.title,
    $date: req.body.date,
    $owner: req.supID
  }, function(err) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        experience: err
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
 * @api {get} /experience Get a JSON object of an experience
 * @apiName GetExperience
 * @apiGroup Experience
 *
 * @apiParam {Number} id  ID of the desired experience
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the experience
 * @apiSuccess {Number} date  date of the experience
 * @apiSuccess {Number} ttime  id of the consumption for which T-0:00 time format is based off
 * @apiSuccess {String} title  title of the experience
 * @apiSuccess {String} notes  notes for the experience
 * @apiSuccess {String} panicmsg  user's panic message for the created experience
 * @apiSuccess {Number} rating_id  rating of general experience quality
 * @apiSuccess {Number} owner  id of the owner of the experience
 * @apiSuccess {Object[]} consumptions  array of consumptions for the experience
 *  @apiSuccess {Number} consumptions.id  id of the consumption
 *  @apiSuccess {Number} consumptions.date  Unix timestamp of the date and time of the consumption
 *  @apiSuccess {Number} consumptions.count  numerical quantity as measured by the drug's unit
 *  @apiSuccess {Number} consumptions.experience_id  ID of the experience the consumption is part of
 *  @apiSuccess {Object[]} consumptions.drug  JSON object of drug
 *   @apiSuccess {Number}   consumptions.drug.id   ID of friend
 *   @apiSuccess {String}   consumptions.drug.name  name of drug
 *   @apiSuccess {String}   consumptions.drug.unit  unit of drug
 *  @apiSuccess {Object[]} consumptions.method  JSON object of method
 *   @apiSuccess {Number}   consumptions.method.id   ID of method
 *   @apiSuccess {String}   consumptions.method.name  name of method
 *  @apiSuccess {String} consumptions.location  location of the consumption
 *  @apiSuccess {Object[]} consumptions.friends  array of JSON objects for friends associated with this consumption.
 *   @apiSuccess {Number}   consumptions.friends.id   ID of friend
 *   @apiSuccess {String}   consumptions.friends.name  name of friend
 *  @apiSuccess {Number} consumptions.owner  id of the owner of the consumption
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "date": 1445543583,
 *        "id": 1,
 *        "notes": "This is great.",
 *        "owner": 1,
 *        "panicmsg": "Oh snap help me!",
 *        "rating_id": 3,
 *        "title": "Great Time",
 *        "ttime": null,
 *        "consumptions": [{
 *          "count": 2,
 *          "date": "1445648036",
 *          "drug": {
 *            "id": 1,
 *            "name": "Oral",
 *            "unit": "mg",
 *          },
 *          "experience_id": 1,
 *          "friends": [{
 *            "id": 1,
 *            "name": "John Smith"
 *          }],
 *          "id": 1,
 *          "location": "San Juan",
 *            "id": 1,
 *            "name": "mg"
 *          },
 *          "owner": 1
 *        }]
 *     }
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
router.get('/', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("id" in req.body) || isNaN(req.body.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      experience: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM experiences WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, experience) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        experience: err
      }));
      return;
    }

    // no experience
    if (experience.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // get the consumptions
    db.all("SELECT * FROM consumptions C LEFT JOIN drugs D ON C.drug_id = D.id LEFT JOIN methods M ON C.method_id = D.id WHERE C.experience_id = $id AND c.owner = $owner ORDER BY date DESC", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err, consumptions) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          experience: err
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

      consumptions.forEach(function(consumption, index) {
        // set up the drug array
        var drugData = {};
        //only load if we have drugs in this con (though that should never happen)
        if (consumption.drug_id !== undefined) {
          drugData.id = consumption.drug_id;
          drugData.name = consumption.name;
          drugData.unit = consumption.unit;
        }

        // set up the method array
        var methodData = {};
        //only load if we have methods in this con (though that should never happen)
        if (consumption.method_id !== undefined) {
          methodData.id = consumption.method_id;
          methodData.name = consumption.unit;
        }

        // we have a consumption; let's parse the friends into it
        db.all("SELECT * FROM friends WHERE consumption_id = $id AND owner = $owner", {
          $id: req.body.id,
          $owner: req.supID
        }, function(err, friends) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).send(JSON.stringify({
              experience: err
            }));
            return;
          }

          // default is empty Friends
          var friendsData = [];

          // we have friends for this consumption
          if (friends.length > 0) {
            friends.forEach(function(friend) {
              friendsData.push({
                "name": friend.name,
                "id": friend.id
              });
            });
          }

          // assemble our consumption
          var compiledConsumption = {
            id: consumption.id,
            date: consumption.date,
            count: consumption.count,
            experience_id: consumption.experience_id,
            drug: drugData,
            method: methodData,
            location: consumption.location,
            friends: friendsData,
            owner: req.supID
          };

          // shove it in our big object
          allConsumptions.push(compiledConsumption);

          // if we've run through all consumptions, load the experience data and fire it
          if (index == consumptions.length - 1) {
            var fullExperience = {
              date: experience[0].date,
              id: experience[0].id,
              notes: experience[0].notes,
              owner: experience[0].owner,
              panicmsg: experience[0].panicmsg,
              rating_id: experience[0].rating_id,
              title: experience[0].title,
              ttime: experience[0].ttime,
              consumptions: allConsumptions
            };

            // bombs away
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(fullExperience);
          }
        });
      });
    });
  });
});

/**
 * @api {delete} /experience Delete an experience
 * @apiName DeleteExperience
 * @apiGroup Experience
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
  db.all("SELECT * FROM experiences WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, experience) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        experience: err
      }));
      return;
    }

    // no experiences returned; nothing for that ID
    if (experience.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    db.run("DELETE FROM experiences WHERE id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          experience: err
        }));
        return;
      }

      // delete the consumptions too
      db.run("DELETE FROM consumptions WHERE experience_id = $id AND owner = $owner", {
        $id: req.body.id,
        $owner: req.supID
      }, function(err) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            experience: err
          }));
          return;
        }

        // deleted the experience
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send();
      });
    });
  });
});


/**
 * @api {put} /experience Update an experience
 * @apiName UpdateExperience
 * @apiGroup Experience
 *
 * @apiParam {Number} id  id of the experience
 * @apiParam {Number} [date]  date of the experience
 * @apiParam {Number} [ttime]  id of the consumption for which T-0:00 time format is based off
 * @apiParam {String} [title]  title of the experience
 * @apiParam {String} [notes]  notes for the experience
 * @apiParam {String} [panicmsg]  user's panic message for the created experience
 * @apiParam {Number} [rating_id]  rating of general experience quality
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
 *       "experience": "no fields provided"
 *     }
 *
 * @apiError illegalField a field to update was send that is not permitted (must be in above list)
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "experience": "custom field requested that is not permitted"
 *     }
 */
router.put('/', function(req, res, next) {
  var permittedFields = ['date', 'notes', 'panicmsg', 'rating_id', 'title', 'ttime', 'id'];

  //no fields were provided
  if (Object.keys(req.body).length === 0 || req.body === undefined) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      experience: "no fields provided"
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

    var query = 'UPDATE experiences SET ' + updateVals.join(', ') + ' WHERE id = $expid AND owner = $owner';
    dataArray.$owner = req.supID;

    // loop through each key and build the JSON object of bindings for sqlite
    Object.keys(req.body).forEach(function(columnName) {
      dataArray["$" + columnName] = req.body[columnName];
    });

    // add the experience ID
    dataArray.$expid = req.body.id;

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
      experience: "custom field requested that is not permitted"
    }));
  }
});

/**
 * @api {get} /experience/search Retrieve an array of experiences that match the provided criteria
 * @apiName SearchExperience
 * @apiGroup Experience
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
 *   @apiSuccess {Number} experiences.consumptions.owner  id of the owner of the consumption

 * @apiParam {Number} [startdate]  Unix timestamp of beginning of date range to select
 * @apiParam {Number} [enddate]  Unix timestamp of end of date range to select
 * @apiParam {String} [title]  experiences where this string is contained in the title will be retrieved
 * @apiParam {String} [notes]  experiences where this string is contained in the notes field will be retrieved
 * @apiParam {Number} [rating_id]  experiences with this rating will be retrieved
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
 *           "name": "Oral",
 *           "unit": "mg"
 *         },
 *         "method": {
 *           "id": 1,
 *           "name": "mg"
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
 * @apiError noResults no experiences match the provided criteris
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found Bad Request
 *
 */
router.get('/search', function(req, res, next) {
  // get our limits and offset
  var limitOffset = "";

  // start assembling the query
  var queryData = {};

  // base and owner
  var query = "SELECT * FROM experiences WHERE owner = $owner";
  queryData.$owner = req.supID;

  if (req.body !== undefined) {
    if ("limit" in req.body) {
      if (parseInt(req.body.limit)) {
        // we have a parseable int
        limitOffset += " LIMIT " + parseInt(req.body.limit);
      }
    }

    if ("offset" in req.body) {
      if (parseInt(req.body.offset)) {
        // we have a parseable int
        limitOffset += "," + parseInt(req.body.offset);
      }
    }

    // get date range
    if ("startdate" in req.body && "enddate" in req.body) {
      // we have date parameters
      query += " AND date BETWEEN $startdate AND $enddate";
      queryData.$startdate = req.body.startdate;
      queryData.$enddate = req.body.enddate;
    }

    // get rating
    if ("rating_id" in req.body) {
      // we have date parameters
      query += " AND rating_id = $rating_id";
      queryData.$rating_id = req.body.rating_id;
    }

    // get notes
    if ("notes" in req.body) {
      // we have date parameters
      query += " AND notes LIKE '%' || $notes || '%'";
      queryData.$notes = req.body.notes;
    }

    // get title
    if ("title" in req.body) {
      // we have date parameters
      query += " AND title LIKE '%' || $title || '%'";
      queryData.$title = req.body.title;
    }

    // slap the limit, offset, and sort on the enddate
    query += " ORDER BY date DESC";
    query += limitOffset;

    // get the entries
    db.all(query, queryData, function(err, experiences) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          experience: err
        }));
        return;
      }

      // no experiences returned
      if (experiences.length === 0) {
        res.setHeader('Content-Type', 'application/json');
        res.status(404).send();
        return;
      }

      var allExperiences = [];

      experiences.forEach(function(singleExperience, experienceIndex) {
        // get consumptions for each experience
        db.all("SELECT * FROM consumptions C LEFT JOIN drugs D ON C.drug_id = D.id LEFT JOIN methods M ON C.method_id = D.id WHERE C.experience_id = $id AND C.owner = $owner ORDER BY date DESC", {
          $id: singleExperience.id,
          $owner: req.supID
        }, function(err, consumptions) {
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
            if (experienceIndex == experiences.length - 1) {
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
              drugData.name = consumption.name;
              drugData.unit = consumption.unit;
            }

            // set up the method array
            var methodData = {};
            //only load if we have methods in this con (though that should never happen)
            if (consumption.method_id !== undefined) {
              methodData.id = consumption.method_id;
              methodData.name = consumption.unit;
            }

            // we have a consumption; let's parse the friends into it
            db.all("SELECT * FROM friends WHERE consumption_id = $id AND owner = $owner", {
              $id: consumption.id,
              $owner: req.supID
            }, function(err, friends) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({
                  experience: err
                }));
                return;
              }

              // default is empty Friends
              var friendsData = [];

              // we have friends for this consumption
              if (friends.length > 0) {
                friends.forEach(function(friend) {
                  friendsData.push({
                    "name": friend.name,
                    "id": friend.id
                  });
                });
              }

              // assemble our consumption
              var compiledConsumption = {
                id: consumption.id,
                date: consumption.date,
                count: consumption.count,
                experience_id: consumption.experience_id,
                drug: drugData,
                method: methodData,
                location: consumption.location,
                friends: friendsData,
                owner: req.supID
              };

              // shove it in our big object
              allConsumptions.push(compiledConsumption);

              // if we've run through all consumptions, load the experience data
              if (index == consumptions.length - 1) {
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
                if (experienceIndex == experiences.length - 1) {
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
  }
});

module.exports = router;
