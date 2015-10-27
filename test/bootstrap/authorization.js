process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('authorization', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
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

  it('rejects invalid users', function testUserAuthInvalid(done) {
    request(server)
      .get('/user')
      .auth('idontexist', 'lol')
      .expect(401, done);
  });

  it('rejects invalid passwords', function testUserAuthBadPass(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/user')
          .auth('myusername', 'NotMyPassword')
          .expect(401, {}, done);
      });
  });

  it('accepts valid users', function testUserAuthValid(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/user')
          .auth('myusername', 'MyPassword')
          .expect(200, done);
      });
  });
});
