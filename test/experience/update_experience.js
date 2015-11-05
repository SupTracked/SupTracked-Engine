/* globals it,describe,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('experience update', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('updates a valid experience', function testExperienceUpdate(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create a new experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // edit that experience
            request(server)
              .put('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1, "title": "My New Title"}')
              .end(function() {
                // make a drug
                request(server)
                  .post('/drug')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"name": "Phenylpiracetam",' +
                    '"unit": "mg",' +
                    '"notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",' +
                    '"classification": "AMPA modulator",' +
                    '"family": "*racetam",' +
                    '"rarity": "Common"' +
                    '}')
                  .end(function() {
                    // make a method
                    request(server)
                      .post('/method')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"name": "Oral",' +
                        '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
                        '}')
                      .end(function() {
                        // add consumption
                        request(server)
                          .post('/consumption')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                          .end(function() {
                            // request and check that it was updated
                            request(server)
                              .get('/experience/1')
                              .auth('myusername', 'MyPassword')
                              .expect(200, {
                                "date": 1445543583,
                                "id": 1,
                                "notes": null,
                                "owner": 1,
                                "panicmsg": null,
                                "rating_id": null,
                                "title": "My New Title",
                                "ttime": null,
                                "consumptions": [{
                                  "id": 1,
                                  "date": "1445648036",
                                  "count": 2,
                                  "experience_id": 1,
                                  "drug": {
                                    "id": 1,
                                    "name": "Phenylpiracetam",
                                    "unit": "mg"
                                  },
                                  "method": {
                                    "id": 1,
                                    "name": "Oral"
                                  },
                                  "location": "San Juan",
                                  "friends": [

                                  ],
                                  "owner": 1
                                }]
                              }, done);
                          });
                      });
                  });
              });
          });
      });
  });

  it('denies update on another user', function testExperienceUpdateOtherUser(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/register')
          .set('Content-Type', 'application/json')
          .send('{"username": "myotherusername", "password": "MyPassword"}')
          .end(function() {
            // create a new experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "date": 1445543583}')
              .end(function() {
                // edit that experience
                request(server)
                  .put('/experience')
                  .auth('myotherusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1, "title": "My New Title"}')
                  .expect(404, done);
              });
          });
      });
  });

  it('denies experience update with an invalid field', function testExperienceUpdateInvalid(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create a new experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // edit that experience
            request(server)
              .put('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1, "notafield": "value"}')
              .expect(400, {
                "experience": "custom field requested that is not permitted"
              }, done);
          });
      });
  });
});
