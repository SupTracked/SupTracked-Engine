/* globals it,describe,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('consumption create', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('requests authorization', function testConsumptionAuthReq(done) {
    request(server)
      .post('/consumption')
      .expect(401, done);
  });

  it('denies missing JSON', function testConsumptionMissingJSON(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/consumption')
          .auth('myusername', 'MyPassword')
          .expect(400, {
            "consumption": "date, count, experience_id, drug_id, method_id, and location required"
          }, done);
      });
  });

  it('denies missing fields', function testConsumptionMissing(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/consumption')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(400, {
            "consumption": "date, count, experience_id, drug_id, method_id, and location required"
          }, done);
      });
  });

  it('denies invalid timestamp', function testConsumptionBadTimestamp(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/consumption')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"count": 2, "experience_id": 1, "date": "notadate", "location": "San Juan", "drug_id": 2, "method_id": 1}')
          .expect(400, {
            "consumption": "timestamp must be positive unix time integer, down to seconds resolution"
          }, done);
      });
  });

  it('denies invalid experience', function testConsumptionInvalidExperience(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/consumption')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 2, "method_id": 1}')
          .expect(400, {
            "consumption": "the requested experience association doesn't exist or belong to this user"
          }, done);
      });
  });

  it('denies invalid drug', function testConsumptionInvalidDrug(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
          .end(function() {
            // add consumption for that experience with an invalid drug
            request(server)
              .post('/consumption')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 2, "method_id": 1}')
              .expect(400, {
                "consumption": "the requested drug association doesn't exist or belong to this user"
              }, done);
          });
      });
  });

  it('denies invalid method', function testConsumptionInvalidMethod(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                // add consumption for that experience and drug with an invalid method
                request(server)
                  .post('/consumption')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                  .expect(400, {
                    "consumption": "the requested method association doesn't exist or belong to this user"
                  }, done);
              });
          });
      });
  });

  it('creates a valid consumption', function testConsumptionCreation(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                      .expect(201, {
                        "id": 1
                      }, done);
                  });
              });
          });
      });
  });

  it('verifies a valid consumption', function testConsumptionCreation(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                          .get('/consumption/1')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .expect(200, {
                            "id": 1,
                            "date": "1445648036",
                            "count": 2,
                            "grouping": null,
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
                          }, done);
                      });
                  });
              });
          });
      });
  });

  it('denies retrieval with missing JSON', function testConsumptionMissingJSON(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/consumption')
          .auth('myusername', 'MyPassword')
          .expect(404, done);
      });
  });

  it('denies retrieval with missing id and no record', function testConsumptionMissingIDNoRecord(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/consumption')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(404, done);
      });
  });

  it('404s on a nonexistent ID', function testConsumptionNoRecordForID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/consumption/1')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(404, done);
      });
  });
});
