process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('consumption update', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('updates a consumption', function testConsumptionUpdate(done) {
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
                          .put('/consumption')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"id": 1, "count": 17}')
                          .expect(200, done);
                      });
                  });
              });
          });
      });
  });

  it('retrieves an updated consumption', function testConsumptionUpdateRetrieval(done) {
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
                        // update consumpetion
                        request(server)
                          .put('/consumption')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"id": 1, "count": 17}')
                          .end(function() {
                            request(server)
                              .get('/consumption')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"id": 1}')
                              .expect(200, {
                                "id": 1,
                                "date": "1445648036",
                                "count": 17,
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
  });

  it('refuses update on another user', function testConsumptionUpdateOtherUser(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make another user
        request(server)
          .post('/register')
          .set('Content-Type', 'application/json')
          .send('{"username": "myotherusername", "password": "MyPassword"}')
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
                              .put('/consumption')
                              .auth('myotherusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"id": 1, "count": 17}')
                              .expect(404, done);
                          });
                      });
                  });
              });
          });
      });
  });
});
