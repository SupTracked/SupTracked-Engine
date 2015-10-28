var config = require('../config');
var multer = require('multer');
var rimraf = require('rimraf');
var fs = require('fs');
var path = require('path');

if (process.env.NODE_ENV == "test") {
  var uploadLocation = config.media.test_location;
} else {
  var uploadLocation = config.media.location;
}


var upload = multer({
  dest: uploadLocation
});

var express = require('express');
var router = express.Router();

/**
 * @api {post} /media Create a media entry (must use multipart form)
 * @apiName CreateMedia
 * @apiGroup Media
 *
 * @apiParam {File} image  the desired image
 * @apiParam {String} title  title of the image
 * @apiParam {String} [tags]  tags for the image
 * @apiParam {String} [date]  date the image was taken (leave blank for current date and time)
 * @apiParam {String} association_type  what type of object the media should be associated with; "drug" or "experience"
 * @apiParam {Number} association  id of the associated drug or experience
 * @apiParam {Number} [explicit]  1 indicates that the content is explicit (defaults to 0)
 * @apiParam {Number} [favorite]  1 indicates that the content is a favorite piece of content (defaults to 0)
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the created media
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
 *       "media": "file, title, association_type, and association required"
 *     }
 *
 * @apiError badAssociationType associationType was not "drug" or "experience"
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "media": "associationType was not 'drug' or 'experience'"
 *     }
 *
 * @apiError badAssociation association was not found with the given ID
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "media": "association not found"
 *     }
 */

router.post('/', upload.single('image'), function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || req.file === undefined ||
    !("title" in req.body) || !("association_type" in req.body) ||
    !("association" in req.body)) {
    // kill the uploaded file if it exists
    if (req.file !== undefined && fs.existsSync(req.file.destination + req.file.filename)) {
      rimraf(req.file.destination + req.file.filename);
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      media: "file, title, notes, association_type, and association required"
    }));
    return;
  }

  // make sure the association_type is valid
  if (req.body.association_type != 'drug' && req.body.association_type != 'experience') {
    // kill the uploaded file (it exists because we got this far)
    rimraf(req.file.destination + req.file.filename, function() {
      // file is deleted; tell about the problem
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        media: "association_type was not 'drug' or 'experience'"
      }));
      return;
    });
    return;
  }

  // make sure the association actually exists
  // (low risk of injection because we were explicit in checking above)
  db.all("SELECT * FROM " + req.body.association_type + "s WHERE id = $id AND owner = $owner", {
    $id: req.body.association,
    $owner: req.supID
  }, function(err, association) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        media: err
      }));
      return;
    }

    if (association.length > 0) {
      // compile out optional parameters
      if (req.body.tags === undefined) {
        req.body.tags = '';
      }

      if (req.body.explicit === undefined) {
        req.body.explicit = 0;
      }

      if (req.body.favorite === undefined) {
        req.body.favorite = 0;
      }

      if (req.body.date === undefined) {
        req.body.date = Math.floor(Date.now() / 1000);
      }


      // insert it
      db.run("INSERT INTO media (filename, title, tags, date, association_type, association, explicit, favorite, owner)" +
        " VALUES ($filename, $title, $tags, $date, $association_type, $association, $explicit, $favorite, $owner)", {
          $filename: req.file.destination + req.file.filename,
          $title: req.body.title,
          $tags: req.body.tags,
          $date: req.body.date,
          $association_type: req.body.association_type,
          $association: req.body.association,
          $explicit: req.body.explicit,
          $favorite: req.body.favorite,
          $owner: req.supID
        },
        function(err) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).send(JSON.stringify({
              media: err
            }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.status(201).send(JSON.stringify({
            id: this.lastID
          }));
        });
    } else {
      // no association found
      rimraf(req.file.destination + req.file.filename, function() {
        // file is deleted; tell about the problem
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          media: "association not found"
        }));
        return;
      });
    }
  });
});

/**
 * @api {get} /media Get a JSON object of a media object
 * @apiName GetMedia
 * @apiGroup Media
 *
 * @apiParam {Number} id  ID of the desired media
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the media
 * @apiSuccess {String} title  title of the image
 * @apiSuccess {String} tags  tags for the image
 * @apiSuccess {String} date  date the image was taken
 * @apiSuccess {String} association_type  what type of object the media should be associated with; "drug" or "experience"
 * @apiSuccess {Number} association  id of the associated drug or experience
 * @apiSuccess {Number} explicit  1 indicates that the content is explicit
 * @apiSuccess {Number} favorite  1 indicates that the content is a favorite piece of content
 * @apiSuccess {Number} owner   id of the owner
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "id": 1,
 *        "title": "Me",
 *        "tags": "selfie me",
 *        "date": 1445995224,
 *        "association_type": "experience",
 *        "association": "1",
 *        "explicit": 0,
 *        "favorite": 1,
 *        "owner": 1
 *     }
 *
 * @apiError missingID id was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "media": "id must be provided"
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
      media: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM media WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, media) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        media: err
      }));
      return;
    }

    // no drugs returned; nothing for that ID
    if (media.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // pop out the filename
    media[0].filename = undefined;

    // return the media
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(media[0]));
  });
});

/**
 * @api {get} /media/file Get an image file
 * @apiName GetMediaFile
 * @apiGroup Media
 *
 * @apiParam {Number} id  ID of the desired media
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiSuccess {Number} id  id of the media
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [image file]
 *
 * @apiError missingID id was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "media": "id must be provided"
 *     }
 *
 * @apiError noRecords no results found for the given ID
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 */
router.get('/file', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("id" in req.body) || isNaN(req.body.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      media: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM media WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, media) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        media: err
      }));
      return;
    }

    // no drugs returned; nothing for that ID
    if (media.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    // return the media
    res.sendFile(path.resolve(media[0].filename));
    return;
  });
});

/**
 * @api {delete} /media Delete a media object
 * @apiName DeleteMedia
 * @apiGroup Media
 *
 * @apiParam {Number} id  ID of the media
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiError missingID id was not provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "media": "id must be provided"
 *     }
 *
 * @apiError noRecords no media exists for the given ID
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 */
router.delete('/', function(req, res, next) {
  // not enough fields were provided
  if (req.body === undefined || !("id" in req.body) || isNaN(req.body.id)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      media: "id must be provided"
    }));
    return;
  }

  // get the entry
  db.all("SELECT * FROM media WHERE id = $id AND owner = $owner", {
    $id: req.body.id,
    $owner: req.supID
  }, function(err, media) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        media: err
      }));
      return;
    }

    // no drugs returned; nothing for that ID
    if (media.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).send();
      return;
    }

    db.run("DELETE FROM media WHERE id = $id AND owner = $owner", {
      $id: req.body.id,
      $owner: req.supID
    }, function(err) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
          media: err
        }));
        return;
      }

      // deleted the media; now kill the file
      rimraf(media[0].filename, function() {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send();
        return;
      });
    });
  });
});

module.exports = router;
