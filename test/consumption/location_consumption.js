process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('consumption location', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('returns a list of locations', function testConsumptionLocations(done) {
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
                        // add another consumption
                        request(server)
                          .post('/consumption')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "Maine", "drug_id": 1, "method_id": 1}')
                          .end(function() {
                            request(server)
                              .get('/consumption/locations')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"id": 1}')
                              .expect(200, [{
                                location: 'Maine',
                                use_count: 1
                              }, {
                                location: 'San Juan',
                                use_count: 1
                              }], done);
                          });
                      });
                  });
              });
          });
      });
  });
});
