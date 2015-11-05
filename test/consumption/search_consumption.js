/* globals it,describe,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('consumption search', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('returns 400 when no search criteria is provided', function testConsumptionSearchNoCriteria(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/consumption/search')
          .auth('myusername', 'MyPassword')
          .expect(400, {
            "consumption": "at least one field must be provided"
          }, done);
      });
  });

  it('404s on no results', function testConsumptionSearch404(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/consumption/search')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"drug_id": 1}')
          .expect(404, done);
      });
  });

  it('searches on drug_id', function testConsumptionSearchDrug(done) {
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
          .send('{"title": "My Title", "date": 1440000000}')
          .end(function() {
            // make another experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Different Title", "date": 1460000000}')
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
                    // make another drug
                    request(server)
                      .post('/drug')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"name": "Aspirin",' +
                        '"unit": "mg",' +
                        '"notes": "Painkiller",' +
                        '"classification": "COXi",' +
                        '"family": "NSAID",' +
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
                            // make another method
                            request(server)
                              .post('/method')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"name": "Bucal",' +
                                '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
                                '}')
                              .end(function() {
                                // add consumption to experience 1
                                request(server)
                                  .post('/consumption')
                                  .auth('myusername', 'MyPassword')
                                  .set('Content-Type', 'application/json')
                                  .send('{"count": 1, "experience_id": 1, "date": 1440000000, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                                  .end(function() {
                                    // add consumption to experience 2
                                    request(server)
                                      .post('/consumption')
                                      .auth('myusername', 'MyPassword')
                                      .set('Content-Type', 'application/json')
                                      .send('{"count": 2, "experience_id": 2, "date": 1460000000, "location": "Santa Rosa", "drug_id": 2, "method_id": 2}')
                                      .end(function() {
                                        // add a friend to consumption 1
                                        request(server)
                                          .post('/consumption/friend')
                                          .auth('myusername', 'MyPassword')
                                          .set('Content-Type', 'application/json')
                                          .send('{"consumption_id": 1, "name": "John Smith"}')
                                          .end(function() {
                                            request(server)
                                              .post('/consumption/search')
                                              .auth('myusername', 'MyPassword')
                                              .set('Content-Type', 'application/json')
                                              .send('{"drug_id": 1}')
                                              .expect(200, [{
                                                "date": 1440000000,
                                                "id": 1,
                                                "notes": null,
                                                "owner": 1,
                                                "panicmsg": null,
                                                "rating_id": null,
                                                "title": "My Title",
                                                "ttime": null,
                                                "consumptions": [{
                                                  "id": 1,
                                                  "date": "1440000000",
                                                  "count": 1,
                                                  "experience_id": 1,
                                                  "drug": {
                                                    "id": 1,
                                                    "unit": "mg"
                                                  },
                                                  "method": {
                                                    "id": 1,
                                                    "name": "Bucal"
                                                  },
                                                  "location": "San Juan",
                                                  "friends": [{
                                                    "id": 1,
                                                    "consumption_id": 1,
                                                    "name": "John Smith",
                                                    "owner": 1
                                                  }],
                                                  "owner": 1
                                                }]
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
  });

  it('searches on method_id', function testConsumptionSearchMethod(done) {
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
          .send('{"title": "My Title", "date": 1440000000}')
          .end(function() {
            // make another experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Different Title", "date": 1460000000}')
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
                    // make another drug
                    request(server)
                      .post('/drug')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"name": "Aspirin",' +
                        '"unit": "mg",' +
                        '"notes": "Painkiller",' +
                        '"classification": "COXi",' +
                        '"family": "NSAID",' +
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
                            // make another method
                            request(server)
                              .post('/method')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"name": "Bucal",' +
                                '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
                                '}')
                              .end(function() {
                                // add consumption to experience 1
                                request(server)
                                  .post('/consumption')
                                  .auth('myusername', 'MyPassword')
                                  .set('Content-Type', 'application/json')
                                  .send('{"count": 1, "experience_id": 1, "date": 1440000000, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                                  .end(function() {
                                    // add consumption to experience 2
                                    request(server)
                                      .post('/consumption')
                                      .auth('myusername', 'MyPassword')
                                      .set('Content-Type', 'application/json')
                                      .send('{"count": 2, "experience_id": 2, "date": 1460000000, "location": "Santa Rosa", "drug_id": 2, "method_id": 2}')
                                      .end(function() {
                                        // add a friend to consumption 1
                                        request(server)
                                          .post('/consumption/friend')
                                          .auth('myusername', 'MyPassword')
                                          .set('Content-Type', 'application/json')
                                          .send('{"consumption_id": 1, "name": "John Smith"}')
                                          .end(function() {
                                            request(server)
                                              .post('/consumption/search')
                                              .auth('myusername', 'MyPassword')
                                              .set('Content-Type', 'application/json')
                                              .send('{"method_id": 1}')
                                              .expect(200, [{
                                                "date": 1440000000,
                                                "id": 1,
                                                "notes": null,
                                                "owner": 1,
                                                "panicmsg": null,
                                                "rating_id": null,
                                                "title": "My Title",
                                                "ttime": null,
                                                "consumptions": [{
                                                  "id": 1,
                                                  "date": "1440000000",
                                                  "count": 1,
                                                  "experience_id": 1,
                                                  "drug": {
                                                    "id": 1,
                                                    "unit": "mg"
                                                  },
                                                  "method": {
                                                    "id": 1,
                                                    "name": "Bucal"
                                                  },
                                                  "location": "San Juan",
                                                  "friends": [{
                                                    "id": 1,
                                                    "consumption_id": 1,
                                                    "name": "John Smith",
                                                    "owner": 1
                                                  }],
                                                  "owner": 1
                                                }]
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
  });

  it('searches on date', function testConsumptionSearchDate(done) {
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
          .send('{"title": "My Title", "date": 1440000000}')
          .end(function() {
            // make another experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Different Title", "date": 1460000000}')
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
                    // make another drug
                    request(server)
                      .post('/drug')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"name": "Aspirin",' +
                        '"unit": "mg",' +
                        '"notes": "Painkiller",' +
                        '"classification": "COXi",' +
                        '"family": "NSAID",' +
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
                            // make another method
                            request(server)
                              .post('/method')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"name": "Bucal",' +
                                '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
                                '}')
                              .end(function() {
                                // add consumption to experience 1
                                request(server)
                                  .post('/consumption')
                                  .auth('myusername', 'MyPassword')
                                  .set('Content-Type', 'application/json')
                                  .send('{"count": 1, "experience_id": 1, "date": 1440000000, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                                  .end(function() {
                                    // add consumption to experience 2
                                    request(server)
                                      .post('/consumption')
                                      .auth('myusername', 'MyPassword')
                                      .set('Content-Type', 'application/json')
                                      .send('{"count": 2, "experience_id": 2, "date": 1460000000, "location": "Santa Rosa", "drug_id": 2, "method_id": 2}')
                                      .end(function() {
                                        // add a friend to consumption 1
                                        request(server)
                                          .post('/consumption/friend')
                                          .auth('myusername', 'MyPassword')
                                          .set('Content-Type', 'application/json')
                                          .send('{"consumption_id": 1, "name": "John Smith"}')
                                          .end(function() {
                                            request(server)
                                              .post('/consumption/search')
                                              .auth('myusername', 'MyPassword')
                                              .set('Content-Type', 'application/json')
                                              .send('{"startdate": 1430000000, "enddate": 1450000000}')
                                              .expect(200, [{
                                                "date": 1440000000,
                                                "id": 1,
                                                "notes": null,
                                                "owner": 1,
                                                "panicmsg": null,
                                                "rating_id": null,
                                                "title": "My Title",
                                                "ttime": null,
                                                "consumptions": [{
                                                  "id": 1,
                                                  "date": "1440000000",
                                                  "count": 1,
                                                  "experience_id": 1,
                                                  "drug": {
                                                    "id": 1,
                                                    "unit": "mg"
                                                  },
                                                  "method": {
                                                    "id": 1,
                                                    "name": "Bucal"
                                                  },
                                                  "location": "San Juan",
                                                  "friends": [{
                                                    "id": 1,
                                                    "consumption_id": 1,
                                                    "name": "John Smith",
                                                    "owner": 1
                                                  }],
                                                  "owner": 1
                                                }]
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
  });
  it('searches on location', function testConsumptionSearchLocation(done) {
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
          .send('{"title": "My Title", "date": 1440000000}')
          .end(function() {
            // make another experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Different Title", "date": 1460000000}')
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
                    // make another drug
                    request(server)
                      .post('/drug')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"name": "Aspirin",' +
                        '"unit": "mg",' +
                        '"notes": "Painkiller",' +
                        '"classification": "COXi",' +
                        '"family": "NSAID",' +
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
                            // make another method
                            request(server)
                              .post('/method')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"name": "Bucal",' +
                                '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
                                '}')
                              .end(function() {
                                // add consumption to experience 1
                                request(server)
                                  .post('/consumption')
                                  .auth('myusername', 'MyPassword')
                                  .set('Content-Type', 'application/json')
                                  .send('{"count": 1, "experience_id": 1, "date": 1440000000, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                                  .end(function() {
                                    // add consumption to experience 2
                                    request(server)
                                      .post('/consumption')
                                      .auth('myusername', 'MyPassword')
                                      .set('Content-Type', 'application/json')
                                      .send('{"count": 2, "experience_id": 2, "date": 1460000000, "location": "Santa Rosa", "drug_id": 2, "method_id": 2}')
                                      .end(function() {
                                        // add a friend to consumption 1
                                        request(server)
                                          .post('/consumption/friend')
                                          .auth('myusername', 'MyPassword')
                                          .set('Content-Type', 'application/json')
                                          .send('{"consumption_id": 1, "name": "John Smith"}')
                                          .end(function() {
                                            request(server)
                                              .post('/consumption/search')
                                              .auth('myusername', 'MyPassword')
                                              .set('Content-Type', 'application/json')
                                              .send('{"location": "Juan"}')
                                              .expect(200, [{
                                                "date": 1440000000,
                                                "id": 1,
                                                "notes": null,
                                                "owner": 1,
                                                "panicmsg": null,
                                                "rating_id": null,
                                                "title": "My Title",
                                                "ttime": null,
                                                "consumptions": [{
                                                  "id": 1,
                                                  "date": "1440000000",
                                                  "count": 1,
                                                  "experience_id": 1,
                                                  "drug": {
                                                    "id": 1,
                                                    "unit": "mg"
                                                  },
                                                  "method": {
                                                    "id": 1,
                                                    "name": "Bucal"
                                                  },
                                                  "location": "San Juan",
                                                  "friends": [{
                                                    "id": 1,
                                                    "consumption_id": 1,
                                                    "name": "John Smith",
                                                    "owner": 1
                                                  }],
                                                  "owner": 1
                                                }]
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
  });
  it('limits searches', function testConsumptionSearchLimit(done) {
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
          .send('{"title": "My Title", "date": 1440000000}')
          .end(function() {
            // make another experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Different Title", "date": 1460000000}')
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
                    // make another drug
                    request(server)
                      .post('/drug')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"name": "Aspirin",' +
                        '"unit": "mg",' +
                        '"notes": "Painkiller",' +
                        '"classification": "COXi",' +
                        '"family": "NSAID",' +
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
                            // make another method
                            request(server)
                              .post('/method')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"name": "Bucal",' +
                                '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
                                '}')
                              .end(function() {
                                // add consumption to experience 1
                                request(server)
                                  .post('/consumption')
                                  .auth('myusername', 'MyPassword')
                                  .set('Content-Type', 'application/json')
                                  .send('{"count": 1, "experience_id": 1, "date": 1440000000, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                                  .end(function() {
                                    // add consumption to experience 2
                                    request(server)
                                      .post('/consumption')
                                      .auth('myusername', 'MyPassword')
                                      .set('Content-Type', 'application/json')
                                      .send('{"count": 2, "experience_id": 2, "date": 1460000000, "location": "Santa Rosa", "drug_id": 2, "method_id": 2}')
                                      .end(function() {
                                        // add a friend to consumption 1
                                        request(server)
                                          .post('/consumption/friend')
                                          .auth('myusername', 'MyPassword')
                                          .set('Content-Type', 'application/json')
                                          .send('{"consumption_id": 1, "name": "John Smith"}')
                                          .end(function() {
                                            request(server)
                                              .post('/consumption/search')
                                              .auth('myusername', 'MyPassword')
                                              .set('Content-Type', 'application/json')
                                              .send('{"location": " ", "limit": 1}')
                                              .expect(200, [{
                                                "date": 1460000000,
                                                "id": 2,
                                                "notes": null,
                                                "owner": 1,
                                                "panicmsg": null,
                                                "rating_id": null,
                                                "title": "Different Title",
                                                "ttime": null,
                                                "consumptions": [{
                                                  "id": 2,
                                                  "date": "1460000000",
                                                  "count": 2,
                                                  "experience_id": 2,
                                                  "drug": {
                                                    "id": 2,
                                                    "unit": "mg"
                                                  },
                                                  "method": {
                                                    "id": 2,
                                                    "name": "Bucal"
                                                  },
                                                  "location": "Santa Rosa",
                                                  "friends": [],
                                                  "owner": 1
                                                }]
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
  });

  it('offsets searches', function testConsumptionSearchOffset(done) {
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
          .send('{"title": "My Title", "date": 1440000000}')
          .end(function() {
            // make another experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Different Title", "date": 1460000000}')
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
                    // make another drug
                    request(server)
                      .post('/drug')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"name": "Aspirin",' +
                        '"unit": "mg",' +
                        '"notes": "Painkiller",' +
                        '"classification": "COXi",' +
                        '"family": "NSAID",' +
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
                            // make another method
                            request(server)
                              .post('/method')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"name": "Bucal",' +
                                '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
                                '}')
                              .end(function() {
                                // add consumption to experience 1
                                request(server)
                                  .post('/consumption')
                                  .auth('myusername', 'MyPassword')
                                  .set('Content-Type', 'application/json')
                                  .send('{"count": 1, "experience_id": 1, "date": 1440000000, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                                  .end(function() {
                                    // add consumption to experience 2
                                    request(server)
                                      .post('/consumption')
                                      .auth('myusername', 'MyPassword')
                                      .set('Content-Type', 'application/json')
                                      .send('{"count": 2, "experience_id": 2, "date": 1460000000, "location": "Santa Rosa", "drug_id": 2, "method_id": 2}')
                                      .end(function() {
                                        // add a friend to consumption 1
                                        request(server)
                                          .post('/consumption/friend')
                                          .auth('myusername', 'MyPassword')
                                          .set('Content-Type', 'application/json')
                                          .send('{"consumption_id": 1, "name": "John Smith"}')
                                          .end(function() {
                                            request(server)
                                              .post('/consumption/search')
                                              .auth('myusername', 'MyPassword')
                                              .set('Content-Type', 'application/json')
                                              .send('{"location": " ", "limit": 1, "offset": 1}')
                                              .expect(200, [{
                                                "date": 1440000000,
                                                "id": 1,
                                                "notes": null,
                                                "owner": 1,
                                                "panicmsg": null,
                                                "rating_id": null,
                                                "title": "My Title",
                                                "ttime": null,
                                                "consumptions": [{
                                                  "id": 1,
                                                  "date": "1440000000",
                                                  "count": 1,
                                                  "experience_id": 1,
                                                  "drug": {
                                                    "id": 1,
                                                    "unit": "mg"
                                                  },
                                                  "method": {
                                                    "id": 1,
                                                    "name": "Bucal"
                                                  },
                                                  "location": "San Juan",
                                                  "friends": [{
                                                    "id": 1,
                                                    "consumption_id": 1,
                                                    "name": "John Smith",
                                                    "owner": 1
                                                  }],
                                                  "owner": 1
                                                }]
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
  });
});
