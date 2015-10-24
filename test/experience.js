process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('experience', function() {
  var server;

  beforeEach(function() {
    server = require('../bin/www', {
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
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
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
                "ttime": null
              }, done);
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
                // request and check that it was updated
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
                    "title": "My New Title",
                    "ttime": null
                  }, done);
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

  it('returns 404 when no search results exist', function testExperienceSearch404(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/experience/search')
          .auth('myusername', 'MyPassword')
          .expect(404, done);
      });
  });

  it('returns experience on empty search', function testExperienceSearchEmpty(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // run an empty search
            request(server)
              .get('/experience/search')
              .auth('myusername', 'MyPassword')
              .expect(200, [{
                id: 1,
                date: 1445543583,
                ttime: null,
                title: 'My Title',
                notes: null,
                panicmsg: null,
                rating_id: null,
                owner: 1
              }], done);
          });
      });
  });

  it('limits search results', function testExperienceSearchLimit(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/experience/search')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"limit": 1}')
                  .expect(200, [{
                    id: 1,
                    date: 1445543583,
                    ttime: null,
                    title: 'My Title',
                    notes: null,
                    panicmsg: null,
                    rating_id: null,
                    owner: 1
                  }], done);
              });
          });
      });
  });

  it('offsets search results', function testExperienceSearchOffset(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "date": 1445543583}')
              .end(function() {
                // run a request with a limit and an offset
                request(server)
                  .get('/experience/search')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"limit": 1, "offset": 1}')
                  .expect(200, [{
                    id: 2,
                    date: 1445543583,
                    ttime: null,
                    title: 'Cows',
                    notes: null,
                    panicmsg: null,
                    rating_id: null,
                    owner: 1
                  }], done);
              });
          });
      });
  });

  it('searches on titles', function testExperienceSearchTitle(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "date": 1445543583}')
              .end(function() {
                // search on title
                request(server)
                  .get('/experience/search')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"title": "Cows"}')
                  .expect(200, [{
                    id: 2,
                    date: 1445543583,
                    ttime: null,
                    title: 'Cows',
                    notes: null,
                    panicmsg: null,
                    rating_id: null,
                    owner: 1
                  }], done);
              });
          });
      });
  });

  it('searches on notes', function testExperienceSearchNotes(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title","date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "date": 1445543583}')
              .end(function() {
                // edit that experience's notes
                request(server)
                  .put('/experience')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 2, "notes": "Cool story, bro"}')
                  .end(function() {
                    // search for the notes
                    request(server)
                      .get('/experience/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"notes": "Cool"}')
                      .expect(200, [{
                        id: 2,
                        date: 1445543583,
                        ttime: null,
                        title: 'Cows',
                        notes: "Cool story, bro",
                        panicmsg: null,
                        rating_id: null,
                        owner: 1
                      }], done);
                  });
              });
          });
      });
  });

  it('searches on rating', function testExperienceSearchRating(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "date": 1445543583}')
              .end(function() {
                // edit that experience's notes
                request(server)
                  .put('/experience')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 2, "rating_id": 2}')
                  .end(function() {
                    // search for the rating
                    request(server)
                      .get('/experience/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"rating_id": 2}')
                      .expect(200, [{
                        id: 2,
                        date: 1445543583,
                        ttime: null,
                        title: 'Cows',
                        notes: null,
                        panicmsg: null,
                        rating_id: 2,
                        owner: 1
                      }], done);
                  });
              });
          });
      });
  });

  it('searches on date range', function testExperienceSearchDateRange(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1430000000}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "date": 1450000000}')
              .end(function() {
                // search for the daterange
                request(server)
                  .get('/experience/search')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"startdate": 1440000000, "enddate": 1460000000}')
                  .expect(200, [{
                    id: 2,
                    date: 1450000000,
                    ttime: null,
                    title: 'Cows',
                    notes: null,
                    panicmsg: null,
                    rating_id: null,
                    owner: 1
                  }], done);
              });
          });
      });
  });

  it('deletes an experience', function testExperienceDeletion(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make the experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // delete the experience
            request(server)
              .delete('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1}')
              .end(function() {
                request(server)
                  .get('/experience')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1}')
                  .expect(404, done);
              });
          });
      });
  });

  it('deletes an experience', function testExperienceDeletion(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make the experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // delete the experience
            request(server)
              .delete('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1}')
              .end(function() {
                request(server)
                  .get('/experience')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1}')
                  .expect(404, done);
              });
          });
      });
  });

  it('refuses to delete without ID', function testExperienceDeletionNoID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make the experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // delete the experience
            request(server)
              .delete('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .expect(400, {
                "experience": "id must be provided"
              }, done);
          });
      });
  });

  it('refuses to delete bad ID', function testExperienceDeletionBadID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make the experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // delete the experience
            request(server)
              .delete('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .set('Content-Type', 'application/json')
              .send('{"id": 99}')
              .expect(404, done);
          });
      });
  });

  it('deletes consumptions underneath an experience', function testExperienceDeletesSub(done) {
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
                      .send('{"count": 2, "experience_id": 1, "date": 1445648036, "drug_id": 1, "method_id": 1}')
                      .end(function() {
                        // delete the experience
                        request(server)
                          .delete('/experience')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"id": 1}')
                          .end(function() {
                            // request the consumption
                            request(server)
                              .get('/consumption')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"id": 1}')
                              .expect(404, done);
                          });
                      });
                  });
              });
          });
      });
  });
});
