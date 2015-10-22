var express = require('express');
var router = express.Router();


/**
 * POST /
 * Create a new experience
 */
router.post('/', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("title" in req.body) || !("date" in req.body) || !("location" in req.body)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      experience: "title, valid date, and location required"
    }));
    return;
  }

  // check for bad timestamp
  if (req.body.date < 0 || isNaN(req.body.date) ) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      experience: "timestamp must be positive unix time integer, down to seconds resolution"
    }));
    return;
  }

  // stick it in
  db.run("INSERT INTO EXPERIENCES (title, date, location, owner) VALUES ($title, $date, $location, $owner)", {
    $title: req.body.title,
    $date: req.body.date,
    $location: req.body.location,
    $owner: req.supID
  }, function(err) {
    if(err){
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
 * GET /
 * Get an experience
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
  db.get("SELECT * FROM EXPERIENCES WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, row) {
    if(err){
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        experience: err
      }));
      return;
    }

    // no rows returned; nothing for that ID
    if(row == []){
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
 * PUT /
 * Update an experience
 */
router.put('/', function(req, res, next){
  var permittedFields = ['date', 'location', 'notes', 'panicmsg', 'rating_id', 'title', 'ttime', 'id'];

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

    var query = 'UPDATE EXPERIENCES SET ' + updateVals.join(', ') + ' WHERE id = $expid AND owner = ' + req.supID ;

    // loop through each key and build the JSON object of bindings for sqlite
    Object.keys(req.body).forEach(function(columnName) {
      dataArray["$" + columnName] = req.body[columnName];
    });

    // add the experience ID
    dataArray.$expid = req.body.id;

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
      experience: "custom field requested that is not permitted"
    }));
  }
});
module.exports = router;
