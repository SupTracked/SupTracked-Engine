/* globals it,describe,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('experience create', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('requests authorization', function testExperienceAuthReq(done) {
    request(server)
      .post('/experience')
      .expect(401, done);
  });

  it('denies missing JSON', function testExperienceMissingJSON(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .expect(400, {
            "experience": "title and valid date required"
          }, done);
      });
  });

  it('denies missing fields', function testExperienceMissing(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(400, {
            "experience": "title and valid date required"
          }, done);
      });
  });

  it('denies invalid timestamp', function testExperienceBadTimestamp(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": "not a date"}')
          .expect(400, {
            "experience": "timestamp must be positive unix time integer, down to seconds resolution"
          }, done);
      });
  });

  it('creates a valid experience', function testExperienceCreation(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .expect(201, {
            "id": 1
          }, done);
      });
  });

  it('retrieves a valid experience', function testExperienceRetrieval(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
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
                        request(server)
                          .get('/experience')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"id": 1}')
                          .expect(200, {
                            "date": 1445543583,
                            "id": 1,
                            "notes": null,
                            "owner": 1,
                            "panicmsg": null,
                            "rating_id": null,
                            "title": "My Title",
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
                              "friends": [],
                              "owner": 1
                            }]
                          }, done);
                      });
                  });
              });
          });
      });
  });

  it('returns 404 with no experience for ID', function testExperienceRetrieval404(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"id": 2}')
          .expect(404, done);
      });
  });
});
