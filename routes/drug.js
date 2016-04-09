/* globals db */
"use strict";
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
 * @apiParam {String} slang  slang name for a single dose
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

  if(!("slang" in req.body)){
    req.body.slang = null;
  }

  // stick it in
  db.run("INSERT INTO drugs (name, unit, notes, classification, family, rarity, slang, owner)" +
    " VALUES ($name, $unit, $notes, $classification, $family, $rarity, $slang, $owner)", {
      $name: req.body.name,
      $unit: req.body.unit,
      $notes: req.body.notes,
      $classification: req.body.classification,
      $family: req.body.family,
      $rarity: req.body.rarity,
      $slang: req.body.slang,
      $owner: req.supID
    },
    function(err) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          drug: err
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
 * @apiParam {String} [slang]  slang name for single dose
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
  var permittedFields = ['name', 'unit', 'notes', 'classification', 'family', 'rarity', 'id', 'slang'];

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

    db.all("SELECT * FROM drugs WHERE id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err, drug) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          drug: err
        }));
        return;
      }

      // no drugs returned; nothing for that ID
      if (drug.length === 0) {
        res.setHeader('Content-Type', 'application/json');
        res.status(404).send();
        return;
      }

      var query = 'UPDATE drugs SET ' + updateVals.join(', ') + ' WHERE id = $id AND owner = $owner';
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
      drug: "custom field requested that is not permitted"
    }));
  }
});

/**
 * @api {delete} /drug Delete a drug
 * @apiName DeleteDrug
 * @apiGroup Drug
 *
 * @apiParam {Number} id  ID of the drug
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
 *       "drug": "id must be provided"
 *     }
 *
 * @apiError inUse drug is currently used in a consumption; followed by array of full consumptions it's used in
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "drug": "drug in use",
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
      drug: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM drugs WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, drug) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        drug: err
      }));
      return;
    }

    // no drugs returned; nothing for that ID
    if (drug.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // makes sure it's not in consumptions
    db.all("SELECT * FROM consumptions WHERE drug_id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err, consumption) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          drug: err
        }));
        return;
      }

      if (consumption.length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          drug: "drug in use",
          consumptions: consumption
        }));
        return;
      }

      // we're clear; delete it
      db.run("DELETE FROM drugs WHERE id = $id AND owner = $owner", {
        $id: req.body.id,
        $owner: req.supID
      }, function(err) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.status(400).send(JSON.stringify({
            drug: err
          }));
          return;
        }

        // deleted the drug
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send();
      });
    });
  });
});

/**
 * @api {get} /drug/all Get a unique list of all drugs owned by the user
 * @apiName GetAllDrugs
 * @apiGroup Drug
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Object[]} drugs json array of drugs.
 *  @apiSuccess {Object[]} drugs.drug  JSON array for individual drug
 *    @apiSuccess {Number}   drugs.drug.id  drug id.
 *    @apiSuccess {String}   drugs.drug.name  drug name
 *    @apiSuccess {String}   drugs.drug.unit  drug name
 *    @apiSuccess {String}   drugs.drug.notes  drug name
 *    @apiSuccess {String}   drugs.drug.classification  drug name
 *    @apiSuccess {String}   drugs.drug.family  drug family
 *    @apiSuccess {String}   drugs.drug.rarity  drug rarity
 *    @apiSuccess {String}   drugs.drug.slang  slang for a single dose
 *    @apiSuccess {Number}   drugs.drug.use_count  number of times that the drug has been used in consumptions
 *    @apiSuccess {Number}   drugs.drug.owner  id of the owner of the drug
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "id": 2,
 *       "name": "Ibuprofen",
 *       "unit": "mg",
 *       "notes": "Ibuprofen is a painkiller",
 *       "classification": "COX inhibitor",
 *       "family": "NSAID",
 *       "rarity": "Common",
 *       "slang": '',
 *       "use_count": 0,
 *       "owner": 1
 *     }, {
 *       "id": 1,
 *       "name": "Phenylpiracetam",
 *       "unit": "mg",
 *       "notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",
 *       "classification": "AMPA modulator",
 *       "family": "*racetam",
 *       "rarity": "Common",
 *       "use_count": 0,
 *       "slang": '',
 *       "owner": 1
 *     }]
 */
router.get('/all', function(req, res, next) {
  // get drugs
  db.all("SELECT *, (SELECT count(*) as count FROM consumptions as C WHERE C.drug_id = D.id) as use_count FROM drugs D WHERE D.owner = $owner GROUP BY name ORDER BY use_count DESC", {
    $owner: req.supID
  }, function(err, drugs) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        drug: err
      }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(drugs);
  });
});


/**
 * @api {get} /drug/:id Get a JSON object of an drug
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
 * @apiSuccess {String} slang  slang for a single dose
 * @apiSuccess {Number} owner  id of the owner of the experience
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
 *        "slang": '',
 *        "owner" 1
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
router.get('/:id', function(req, res, next) {
  // not enough fields were provided
  if (req.params === {} || isNaN(req.params.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      drug: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM drugs WHERE id = $id AND owner = $owner", {
    $id: req.params.id,
    $owner: req.supID
  }, function(err, drug) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        drug: err
      }));
      return;
    }

    // no drugs returned; nothing for that ID
    if (drug.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // return the drug
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(drug[0]));
  });
});

module.exports = router;
