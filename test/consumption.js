process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('consumption', function() {
  var server;

  beforeEach(function() {
    server = require('../bin/www', {
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
            "consumption": "date, count, experience_id, drug_id, and method_id required"
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
            "consumption": "date, count, experience_id, drug_id, and method_id required"
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
          .send('{"count": 2, "experience_id": 1, "date": "notadate", "drug_id": 2, "method_id": 1}')
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
          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "drug_id": 2, "method_id": 1}')
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
              .send('{"count": 2, "experience_id": 1, "date": 1445648036, "drug_id": 2, "method_id": 1}')
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
                  .send('{"count": 2, "experience_id": 1, "date": 1445648036, "drug_id": 1, "method_id": 1}')
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
                      .send('{"count": 2, "experience_id": 1, "date": 1445648036, "drug_id": 1, "method_id": 1}')
                      .expect(201, {
                        "id": 1
                      }, done);
                  });
              });
          });
      });
  });

  //
  // it('creates a valid experience', function testExperienceCreation(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .expect(201, {"id": 1}, done);
  //     });
  // });
  //
  // it('retrieves a valid experience', function testExperienceRetrieval(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           request(server)
  //             .get('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"id": 1}')
  //             .expect(200, {
  //               "date": 1445543583,
  //               "id": 1,
  //               "location": "My Location",
  //               "notes": null,
  //               "owner": 1,
  //               "panicmsg": null,
  //               "rating_id": null,
  //               "title": "My Title",
  //               "ttime": null
  //             }, done);
  //         });
  //     });
  // });
  //
  // it('updates a valid experience', function testExperienceUpdate(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create a new experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           // edit that experience
  //           request(server)
  //             .put('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"id": 1, "title": "My New Title"}')
  //             .end(function() {
  //               // request and check that it was updated
  //               request(server)
  //                 .get('/experience')
  //                 .auth('myusername', 'MyPassword')
  //                 .set('Content-Type', 'application/json')
  //                 .send('{"id": 1}')
  //                 .expect(200, {
  //                   "date": 1445543583,
  //                   "id": 1,
  //                   "location": "My Location",
  //                   "notes": null,
  //                   "owner": 1,
  //                   "panicmsg": null,
  //                   "rating_id": null,
  //                   "title": "My New Title",
  //                   "ttime": null
  //                 }, done);
  //             });
  //         });
  //     });
  // });
  //
  // it('denies experience update with an invalid field', function testExperienceUpdateInvalid(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create a new experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           // edit that experience
  //           request(server)
  //             .put('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"id": 1, "notafield": "value"}')
  //             .expect(400, {
  //               "experience": "custom field requested that is not permitted"
  //             }, done);
  //         });
  //     });
  // });
  //
  // it('returns 404 when no search results exist', function testExperienceSearch404(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       request(server)
  //         .get('/experience/search')
  //         .auth('myusername', 'MyPassword')
  //         .expect(404, done);
  //     });
  // });
  //
  // it('returns experience on empty search', function testExperienceSearchEmpty(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create an experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           // run an empty search
  //           request(server)
  //             .get('/experience/search')
  //             .auth('myusername', 'MyPassword')
  //             .expect(200, [{
  //               id: 1,
  //               date: 1445543583,
  //               ttime: null,
  //               title: 'My Title',
  //               location: 'My Location',
  //               notes: null,
  //               panicmsg: null,
  //               rating_id: null,
  //               owner: 1
  //             }], done);
  //         });
  //     });
  // });
  //
  // it('limits search results', function testExperienceSearchLimit(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create an experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           // create a second experience
  //           request(server)
  //             .post('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
  //             .end(function() {
  //               request(server)
  //                 .get('/experience/search')
  //                 .auth('myusername', 'MyPassword')
  //                 .set('Content-Type', 'application/json')
  //                 .send('{"limit": 1}')
  //                 .expect(200, [{
  //                   id: 1,
  //                   date: 1445543583,
  //                   ttime: null,
  //                   title: 'My Title',
  //                   location: 'My Location',
  //                   notes: null,
  //                   panicmsg: null,
  //                   rating_id: null,
  //                   owner: 1
  //                 }], done);
  //             });
  //         });
  //     });
  // });
  //
  // it('offsets search results', function testExperienceSearchOffset(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create an experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           // create a second experience
  //           request(server)
  //             .post('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
  //             .end(function() {
  //               // run a request with a limit and an offset
  //               request(server)
  //                 .get('/experience/search')
  //                 .auth('myusername', 'MyPassword')
  //                 .set('Content-Type', 'application/json')
  //                 .send('{"limit": 1, "offset": 1}')
  //                 .expect(200, [{
  //                   id: 2,
  //                   date: 1445543583,
  //                   ttime: null,
  //                   title: 'Cows',
  //                   location: 'My Location',
  //                   notes: null,
  //                   panicmsg: null,
  //                   rating_id: null,
  //                   owner: 1
  //                 }], done);
  //             });
  //         });
  //     });
  // });
  //
  // it('searches on titles', function testExperienceSearchTitle(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create an experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           // create a second experience
  //           request(server)
  //             .post('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
  //             .end(function() {
  //               // search on title
  //               request(server)
  //                 .get('/experience/search')
  //                 .auth('myusername', 'MyPassword')
  //                 .set('Content-Type', 'application/json')
  //                 .send('{"title": "Cows"}')
  //                 .expect(200, [{
  //                   id: 2,
  //                   date: 1445543583,
  //                   ttime: null,
  //                   title: 'Cows',
  //                   location: 'My Location',
  //                   notes: null,
  //                   panicmsg: null,
  //                   rating_id: null,
  //                   owner: 1
  //                 }], done);
  //             });
  //         });
  //     });
  // });
  //
  // it('searches on notes', function testExperienceSearchNotes(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create an experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           // create a second experience
  //           request(server)
  //             .post('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
  //             .end(function() {
  //               // edit that experience's notes
  //               request(server)
  //                 .put('/experience')
  //                 .auth('myusername', 'MyPassword')
  //                 .set('Content-Type', 'application/json')
  //                 .send('{"id": 2, "notes": "Cool story, bro"}')
  //                 .end(function() {
  //                   // search for the notes
  //                   request(server)
  //                     .get('/experience/search')
  //                     .auth('myusername', 'MyPassword')
  //                     .set('Content-Type', 'application/json')
  //                     .send('{"notes": "Cool"}')
  //                     .expect(200, [{
  //                       id: 2,
  //                       date: 1445543583,
  //                       ttime: null,
  //                       title: 'Cows',
  //                       location: 'My Location',
  //                       notes: "Cool story, bro",
  //                       panicmsg: null,
  //                       rating_id: null,
  //                       owner: 1
  //                     }], done);
  //                 });
  //             });
  //         });
  //     });
  // });
  //
  // it('searches on location', function testExperienceSearchLocation(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create an experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           // create a second experience
  //           request(server)
  //             .post('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
  //             .end(function() {
  //               // edit that experience's notes
  //               request(server)
  //                 .put('/experience')
  //                 .auth('myusername', 'MyPassword')
  //                 .set('Content-Type', 'application/json')
  //                 .send('{"id": 2, "location": "Someplace"}')
  //                 .end(function() {
  //                   // search for the location
  //                   request(server)
  //                     .get('/experience/search')
  //                     .auth('myusername', 'MyPassword')
  //                     .set('Content-Type', 'application/json')
  //                     .send('{"location": "Someplace"}')
  //                     .expect(200, [{
  //                       id: 2,
  //                       date: 1445543583,
  //                       ttime: null,
  //                       title: 'Cows',
  //                       location: 'Someplace',
  //                       notes: null,
  //                       panicmsg: null,
  //                       rating_id: null,
  //                       owner: 1
  //                     }], done);
  //                 });
  //             });
  //         });
  //     });
  // });
  //
  // it('searches on rating', function testExperienceSearchRating(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create an experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
  //         .end(function() {
  //           // create a second experience
  //           request(server)
  //             .post('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
  //             .end(function() {
  //               // edit that experience's notes
  //               request(server)
  //                 .put('/experience')
  //                 .auth('myusername', 'MyPassword')
  //                 .set('Content-Type', 'application/json')
  //                 .send('{"id": 2, "rating_id": 2}')
  //                 .end(function() {
  //                   // search for the rating
  //                   request(server)
  //                     .get('/experience/search')
  //                     .auth('myusername', 'MyPassword')
  //                     .set('Content-Type', 'application/json')
  //                     .send('{"rating_id": 2}')
  //                     .expect(200, [{
  //                       id: 2,
  //                       date: 1445543583,
  //                       ttime: null,
  //                       title: 'Cows',
  //                       location: 'My Location',
  //                       notes: null,
  //                       panicmsg: null,
  //                       rating_id: 2,
  //                       owner: 1
  //                     }], done);
  //                 });
  //             });
  //         });
  //     });
  // });
  //
  // it('searches on date range', function testExperienceSearchDateRange(done) {
  //   request(server)
  //     .post('/register')
  //     .set('Content-Type', 'application/json')
  //     .send('{"username": "myusername", "password": "MyPassword"}')
  //     .end(function() {
  //       // create an experience
  //       request(server)
  //         .post('/experience')
  //         .auth('myusername', 'MyPassword')
  //         .set('Content-Type', 'application/json')
  //         .send('{"title": "My Title", "location": "My Location", "date": 1430000000}')
  //         .end(function() {
  //           // create a second experience
  //           request(server)
  //             .post('/experience')
  //             .auth('myusername', 'MyPassword')
  //             .set('Content-Type', 'application/json')
  //             .send('{"title": "Cows", "location": "My Location", "date": 1450000000}')
  //             .end(function() {
  //               // search for the daterange
  //               request(server)
  //                 .get('/experience/search')
  //                 .auth('myusername', 'MyPassword')
  //                 .set('Content-Type', 'application/json')
  //                 .send('{"startdate": 1440000000, "enddate": 1460000000}')
  //                 .expect(200, [{
  //                   id: 2,
  //                   date: 1450000000,
  //                   ttime: null,
  //                   title: 'Cows',
  //                   location: 'My Location',
  //                   notes: null,
  //                   panicmsg: null,
  //                   rating_id: null,
  //                   owner: 1
  //                 }], done);
  //             });
  //         });
  //     });
  // });
});
