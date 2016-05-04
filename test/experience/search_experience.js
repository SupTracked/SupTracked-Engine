/* globals it,describe,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('experience search', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('returns 404 when no search results exist', function testExperienceSearch404(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/experience/search')
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
              .post('/experience/search')
              .auth('myusername', 'MyPassword')
              .expect(200, [{
                id: 1,
                date: 1445543583,
                groupCount: null,
                groupDrug: null,
                ttime: null,
                title: 'My Title',
                notes: null,
                panicmsg: null,
                rating_id: null,
                interactions: null,
                owner: 1,
                consumptions: []
              }], done);
          });
      });
  });

  it('returns full search results', function testExperienceFullSearch(done) {
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
                      .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                      .end(function() {
                        // add a friend
                        request(server)
                          .post('/consumption/friend')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"consumption_id": 1, "name": "John Smith"}')
                          .end(function() {
                            request(server)
                              .post('/experience/search')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .expect(200, [{
                                "date": 1445543583,
                                "groupCount": null,
                                "groupDrug": null,
                                "id": 1,
                                "notes": null,
                                "owner": 1,
                                "interactions": null,
                                "panicmsg": null,
                                "rating_id": null,
                                "title": "My Title",
                                "ttime": null,
                                "consumptions": [{
                                  "id": 1,
                                  "date": 1445648036,
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
                                  "friends": [{
                                    "name": "John Smith",
                                    "id": 1,
                                    "consumption_id": 1,
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
                  .post('/experience/search')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"limit": 1}')
                  .expect(200, [{
                    id: 2,
                    date: 1445543583,
                    groupCount: null,
                    groupDrug: null,
                    ttime: null,
                    title: 'Cows',
                    notes: null,
                    panicmsg: null,
                    rating_id: null,
                    owner: 1,
                    interactions: null,
                    consumptions: []
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
                  .post('/experience/search')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"limit": 1, "offset": 1}')
                  .expect(200, [{
                    id: 1,
                    date: 1445543583,
                    groupCount: null,
                    groupDrug: null,
                    ttime: null,
                    title: 'My Title',
                    notes: null,
                    panicmsg: null,
                    rating_id: null,
                    owner: 1,
                    interactions: null,
                    consumptions: []
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
                  .post('/experience/search')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"title": "Cows"}')
                  .expect(200, [{
                    id: 2,
                    date: 1445543583,
                    groupCount: null,
                    groupDrug: null,
                    ttime: null,
                    title: 'Cows',
                    notes: null,
                    panicmsg: null,
                    rating_id: null,
                    owner: 1,
                    interactions: null,
                    consumptions: []
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
                      .post('/experience/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"notes": "Cool"}')
                      .expect(200, [{
                        id: 2,
                        date: 1445543583,
                        groupCount: null,
                        groupDrug: null,
                        ttime: null,
                        title: 'Cows',
                        notes: "Cool story, bro",
                        panicmsg: null,
                        rating_id: null,
                        owner: 1,
                        interactions: null,
                        consumptions: []
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
                      .post('/experience/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"rating_id": 2}')
                      .expect(200, [{
                        id: 2,
                        date: 1445543583,
                        groupCount: null,
                        groupDrug: null,
                        ttime: null,
                        title: 'Cows',
                        notes: null,
                        panicmsg: null,
                        rating_id: 2,
                        owner: 1,
                        interactions: null,
                        consumptions: []
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
                  .post('/experience/search')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"startdate": 1440000000, "enddate": 1460000000}')
                  .expect(200, [{
                    id: 2,
                    date: 1450000000,
                    groupCount: null,
                    groupDrug: null,
                    ttime: null,
                    title: 'Cows',
                    notes: null,
                    panicmsg: null,
                    rating_id: null,
                    interactions: null,
                    owner: 1,
                    consumptions: []
                  }], done);
              });
          });
      });
  });
});
