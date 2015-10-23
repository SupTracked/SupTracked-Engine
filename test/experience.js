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
            "experience": "title, valid date, and location required"
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
            "experience": "title, valid date, and location required"
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
          .send('{"title": "My Title", "location": "My Location", "date": "not a date"}')
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
          .expect(201, {"id": 1}, done);
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
          .end(function() {
            request(server)
              .get('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1}')
              .expect(200, {
                "date": 1445543583,
                "id": 1,
                "location": "My Location",
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                    "location": "My Location",
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
          .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
});
