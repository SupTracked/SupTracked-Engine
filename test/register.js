process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('register', function() {
  var server;

  beforeEach(function() {
    server = require('../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('creates users', function testUser(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .expect(201, done);
  });

  it('catches short usernames', function testShortName(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "name", "password": "MyPassword"}')
      .expect(400, done);
  });

  it('catches bad usernames', function testBadUser(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "!!!!", "password": "MyPassword"}')
      .expect(400, done);
  });

  it('catches short passwords', function testShortPass(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername" "password": "shrt"}')
      .expect(400, done);
  });

  it('doesn\'t allow duplicates', function testDup(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/register')
          .set('Content-Type', 'application/json')
          .send('{"username": "myusername", "password": "MyPassword"}')
          .expect(409, done);
      });
  });
});
