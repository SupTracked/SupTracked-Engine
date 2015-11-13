/* globals db,startTime */
"use strict";

var express = require('express');
var router = express.Router();
var config = require('../data/config');
var client = require('twilio')(config.twilio.sid, config.twilio.auth_token);

/**
 * @api {post} /sms Send an SMS to all emergency contacts
 * @apiName SMS
 * @apiGroup SMS
 *
 * @apiPermission ValidUserBasicAuthRequired
 *
 * @apiParam {String} message  message to send
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiError noContacts no emergency contacts provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 request error
 *     {
 *       "sms": "no emergency contacts provided"
 *     }
 * @apiError general unspecified twilio error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 server error
 *     {
 *       "sms": '[twilio error]'
 *     }
 */
router.post('/', function(req, res, next) {
  if (req.body === undefined || req.body.message === undefined) {
    res.status(400).send();
    return;
  }

  db.all("SELECT * FROM users WHERE id = $id", {
    $id: req.supID
  }, function(err, user) {
    var contacts = user[0].emergcontact.split(',');
    if (contacts.length < 1) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send({
        sms: 'no emergency contacts provided'
      });
      return;
    }

    var completedRequests = 0;
    var twilioError = false;

    contacts.forEach(function(contact) {
      client.messages.create({
        to: contact,
        from: config.twilio.number,
        body: req.body.message
      }, function(err, responseData) { //this function is executed when a response is received from Twilio
        completedRequests += 1;

        if (err) {
          twilioError = err;
        }

        if (completedRequests === contacts.length) {
          if (!twilioError) {
            res.status(200).send();
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(500).send({
              sms: twilioError
            });
            return;
          }
        }
      });
    });
  });
});

module.exports = router;
