process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('consumption friend', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('denies adding a friend with no JSON', function testConsumptionFriendNoJSON(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/consumption/friend')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(400, {
            "consumption": "consumption_id and name required"
          }, done);
      });
  });


  it('denies adding a friend with no fields', function testConsumptionFriendNoFields(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/consumption/friend')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(400, {
            "consumption": "consumption_id and name required"
          }, done);
      });
  });


  it('adds a friend', function testConsumptionFriend(done) {
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
                          .post('/consumption/friend')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"consumption_id": 1, "name": "John Smith"}')
                          .expect(201, done);
                      });
                  });
              });
          });
      });
  });

  it('verifies adding a friend', function testConsumptionFriendVerify(done) {
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
                        // add friend
                        request(server)
                          .post('/consumption/friend')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"consumption_id": 1, "name": "John Smith"}')
                          .end(function() {
                            request(server)
                              .get('/consumption')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"id": 1}')
                              .expect(200,

                                {
                                  id: 1,
                                  date: '1445648036',
                                  count: 2,
                                  experience_id: 1,
                                  drug: {
                                    id: 1,
                                    name: 'Oral',
                                    unit: 'mg'
                                  },
                                  method: {
                                    id: 1,
                                    name: 'mg'
                                  },
                                  location: 'San Juan',
                                  friends: [{
                                    "id": 1,
                                    "name": "John Smith"
                                  }],
                                  owner: 1
                                }, done);
                          });
                      });
                  });
              });
          });
      });
  });

  it('deletes a friend', function testConsumptionDeleteFriend(done) {
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
                        // add friend
                        request(server)
                          .post('/consumption/friend')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"consumption_id": 1, "name": "John Smith"}')
                          .end(function() {
                            request(server)
                              .delete('/consumption/friend')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"id": 1}')
                              .expect(200, done);
                          });
                      });
                  });
              });
          });
      });
  });

  it('verifies deleting a friend', function testConsumptionDeleteFriendVerify(done) {
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
                        // add friend
                        request(server)
                          .post('/consumption/friend')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"consumption_id": 1, "name": "John Smith"}')
                          .end(function() {
                            // remove friend
                            request(server)
                              .delete('/consumption/friend')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"id": 1}')
                              .end(function() {
                                request(server)
                                  .get('/consumption')
                                  .auth('myusername', 'MyPassword')
                                  .set('Content-Type', 'application/json')
                                  .send('{"id": 1}')
                                  .expect(200, {
                                    id: 1,
                                    date: '1445648036',
                                    count: 2,
                                    experience_id: 1,
                                    drug: {
                                      id: 1,
                                      name: 'Oral',
                                      unit: 'mg'
                                    },
                                    method: {
                                      id: 1,
                                      name: 'mg'
                                    },
                                    location: 'San Juan',
                                    friends: [],
                                    owner: 1
                                  }, done);
                              });
                          });
                      });
                  });
              });
          });
      });
  });

  it('returns a list of unique friends', function testAllFriends(done) {
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
                        // add friend to that consumption
                        request(server)
                          .post('/consumption/friend')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"consumption_id": 1, "name": "John Smith"}')
                          .end(function() {
                            // add another friend to that consumption
                            request(server)
                              .post('/consumption/friend')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"consumption_id": 1, "name": "Michael"}')
                              .end(function() {
                                // add duplicate friend to that consumption
                                request(server)
                                  .post('/consumption/friend')
                                  .auth('myusername', 'MyPassword')
                                  .set('Content-Type', 'application/json')
                                  .send('{"consumption_id": 1, "name": "Michael"}')
                                  .end(function() {
                                    request(server)
                                      .get('/consumption/friends')
                                      .auth('myusername', 'MyPassword')
                                      .expect(200, [{
                                        name: 'Michael',
                                        use_count: 2
                                      }, {
                                        name: 'John Smith',
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
  });
});
