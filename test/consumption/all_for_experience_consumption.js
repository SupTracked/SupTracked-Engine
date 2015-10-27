process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('consumptions for experience', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('404s on consumptions by experience with no records', function testConsumptionByExperienceNoRecords(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/consumption')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"id": 1}')
          .expect(404, done);
      });
  });

  it('400s on no JSON for consumptions by experience', function testConsumptionByExperienceNoJSON(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/consumption')
          .auth('myusername', 'MyPassword')
          .expect(400, {
            "consumption": "id must be provided"
          }, done);
      });
  });

  it('400s on no id field for consumptions by experience', function testConsumptionByExperienceNoID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/consumption')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(400, {
            "consumption": "id must be provided"
          }, done);
      });
  });

  it('returns all consumptions for a given experience', function testConsumptionByExperience(done) {
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
                // add a method
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
                        // add friends
                        request(server)
                          .post('/consumption/friend')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"consumption_id": 1, "name": "John Smith"}')
                          .end(function() {
                            request(server)
                              .get('/consumption/experience')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"id": 1}')
                              .expect(200, [{
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
                                "friends": [{
                                  "name": "John Smith",
                                  "id": 1,
                                  "consumption_id": 1,
                                  "owner": 1
                                }],
                                "owner": 1
                              }], done);
                          });
                      });
                  });
              });
          });
      });
  });

  it('returns 404 for experience by consumption with no such experience', function testConsumptionByExperienceNoSuchExperience(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/consumption/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"id": 1}')
          .expect(404, done);
      });
  });
});
