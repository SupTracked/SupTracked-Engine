process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('user', function() {
  var server;

  beforeEach(function() {
    server = require('../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('requests authorization', function testUserAuthReq(done) {
    request(server)
      .get('/user')
      .expect(401, done);
  });

  it('gets empty custom fields', function testUserGetCustomEmpty(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/user')
          .auth('myusername', 'MyPassword')
          .send()
          .expect(200, {
            username: "myusername",
            admin: 0,
            emergcontact: null,
            phone: null
          }, done);
      });
  });

  it('sets custom fields', function testUserGetCustom(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set custom field
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "694165516"}')
          .expect(200, done);
      });
  });

  it('returns set custom fields', function testUserGetSetCustom(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set custom field
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "694165516"}')
          .end(function() {
            // check custom field
            request(server)
              .get('/user')
              .auth('myusername', 'MyPassword')
              .send()
              .expect(200, {
                username: "myusername",
                admin: 0,
                emergcontact: null,
                phone: 694165516
              }, done);
          });
      });
  });

  it('denies empty custom fields', function testUserCustomEmpty(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(400, {"user": "no fields provided"}, done);
      });
  });

  it('denies invalid custom fields', function testUserCustomInvalid(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"notafield": "value"}')
          .expect(400, {"user": "custom field requested that is not permitted"}, done);
      });
  });

  it('allows password changes', function testUserPassword(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .put('/user/password')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"password": "MyNewPassword"}')
          .expect(200, done);
      });
  });

  it('changes the password', function testUserPasswordChange(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .put('/user/password')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"password": "MyNewPassword"}')
          .end(function() {
            request(server)
              .get('/user')
              .auth('myusername', 'MyNewPassword')
              .expect(200, done);
          });
      });
  });

  it('denies password changes with missing JSON', function testUserPasswordMissingJSON(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .put('/user/password')
          .auth('myusername', 'MyPassword')
          .send()
          .expect(400, {"password": "password too short or not provided"}, done);
      });
  });

  it('denies password changes with missing password', function testUserPasswordMissingPassword(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .put('/user/password')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"notpassword": "value"}')
          .expect(400, {"password": "password too short or not provided"}, done);
      });
  });

  it('denies password changes with short password', function testUserPasswordMissingPassword(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .put('/user/password')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"password": "shrt"}')
          .expect(400, {"password": "password too short or not provided"}, done);
      });
  });
});
