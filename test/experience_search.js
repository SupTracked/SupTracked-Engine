process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('experience_search', function() {
  var server;

  beforeEach(function() {
    server = require('../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('returns 404 when nothing exists', function testExperienceSearch404(done) {
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                location: 'My Location',
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
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
                    location: 'My Location',
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
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
                    location: 'My Location',
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
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
                    location: 'My Location',
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
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
                        location: 'My Location',
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

  it('searches on location', function testExperienceSearchLocation(done) {
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
              .end(function() {
                // edit that experience's notes
                request(server)
                  .put('/experience')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 2, "location": "Someplace"}')
                  .end(function() {
                    // search for the location
                    request(server)
                      .get('/experience/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"location": "Someplace"}')
                      .expect(200, [{
                        id: 2,
                        date: 1445543583,
                        ttime: null,
                        title: 'Cows',
                        location: 'Someplace',
                        notes: null,
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "location": "My Location", "date": 1445543583}')
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
                        location: 'My Location',
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
          .send('{"title": "My Title", "location": "My Location", "date": 1430000000}')
          .end(function() {
            // create a second experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "Cows", "location": "My Location", "date": 1450000000}')
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
                    location: 'My Location',
                    notes: null,
                    panicmsg: null,
                    rating_id: null,
                    owner: 1
                  }], done);
              });
          });
      });
  });
});
