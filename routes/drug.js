var express = require('express');
var router = express.Router();


/**
 * @api {post} /drug Create a drug
 * @apiName CreateDrug
 * @apiGroup Drug
 *
 * @apiParam {String} name  name of the drug
 * @apiParam {String} unit  unit of measurement for the drug
 * @apiParam {String} notes  notes about the drug
 * @apiParam {String} classification  drug classification
 * @apiParam {String} family  drug's chemical family
 * @apiParam {String} rarity  drug rarity
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the created drug
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
 *       "drug": "name, unit, notes, classification, family, and rarity required"
 *     }
 */
router.post('/', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("name" in req.body) ||
    !("unit" in req.body) || !("notes" in req.body) ||
    !("classification" in req.body) || !("family" in req.body) ||
    !("rarity" in req.body)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      drug: "name, unit, notes, classification, family, and rarity required"
    }));
    return;
  }

  // stick it in
  db.run("INSERT INTO drugs (name, unit, notes, classification, family, rarity, owner)" +
    " VALUES ($name, $unit, $notes, $classification, $family, $rarity, $owner)", {
      $name: req.body.name,
      $unit: req.body.unit,
      $notes: req.body.notes,
      $classification: req.body.classification,
      $family: req.body.family,
      $rarity: req.body.rarity,
      $owner: req.supID
    },
    function(err) {
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
 * @api {get} /drug Get a JSON object of an drug
 * @apiName GetDrug
 * @apiGroup Drug
 *
 * @apiParam {Number} id  ID of the desired drug
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the drug
 * @apiSuccess {String} name  name of the drug
 * @apiSuccess {String} unit  unit of measurement for the drug
 * @apiSuccess {String} notes  notes about the drug
 * @apiSuccess {String} classification  drug classification
 * @apiSuccess {String} family  drug's chemical family
 * @apiSuccess {String} rarity  drug rarity
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "id": 1,
 *        "name": "Phenylpiracetam",
 *        "unit": "mg",
 *        "notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",
 *        "classification": "AMPA modulator",
 *        "family": "*racetam",
 *        "rarity": "Common",
 *     }
 *
 * @apiError missingID id was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "drug": "id must be provided"
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
      drug: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.get("SELECT * FROM drugs WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, row) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        experience: err
      }));
      return;
    }

    // no rows returned; nothing for that ID
    if (row == []) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // return the drug
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(row));
  });
});

/**
 * @api {put} /drug Update a drug
 * @apiName UpdateDrug
 * @apiGroup Drug
 *
 * @apiParam {Number} id  id of the drug
 * @apiParam {String} [name]  name of the drug
 * @apiParam {String} [unit]  unit of measurement for the drug
 * @apiParam {String} [notes]  notes about the drug
 * @apiParam {String} [classification]  drug classification
 * @apiParam {String} [family]  drug's chemical family
 * @apiParam {String} [rarity]  drug rarity
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
 *       "drug": "no fields provided"
 *     }
 *
 * @apiError illegalField a field to update was send that is not permitted (must be in above list)
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "drug": "custom field requested that is not permitted"
 *     }
 */
router.put('/', function(req, res, next) {
  var permittedFields = ['name', 'unit', 'notes', 'classification', 'family', 'rarity', 'id'];

  //no fields were provided
  if (Object.keys(req.body).length === 0 || req.body === undefined) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      drug: "no fields provided"
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

    var query = 'UPDATE drug SET ' + updateVals.join(', ') + ' WHERE id = $drugid AND owner = $id';
    dataArray.$id = req.supID;

    // loop through each key and build the JSON object of bindings for sqlite
    Object.keys(req.body).forEach(function(columnName) {
      dataArray["$" + columnName] = req.body[columnName];
    });

    // add the drug ID
    dataArray.$drugid = req.body.id;

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
      drug: "custom field requested that is not permitted"
    }));
  }
});

module.exports = router;
