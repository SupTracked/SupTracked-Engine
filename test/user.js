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

  it('rejects invalid users', function testUserAuthInvalid(done) {
    request(server)
      .get('/user')
      .auth('idontexist', 'lol')
      .expect(401, done);
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

  it('gets empty custom fields', function testUserGetCustomEmpty(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/user/customfields')
          .set('Authorization', 'Basic bXl1c2VybmFtZTpNeVBhc3N3b3Jk')
          .send()
          .expect(200, {
            admin: 0,
            daysback: null,
            emergcontact: null,
            favoritecount: null,
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
          .post('/user/customfields')
          .set('Authorization', 'Basic bXl1c2VybmFtZTpNeVBhc3N3b3Jk')
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
          .post('/user/customfields')
          .set('Authorization', 'Basic bXl1c2VybmFtZTpNeVBhc3N3b3Jk')
          .set('Content-Type', 'application/json')
          .send('{"phone": "694165516"}')
          .end(function() {
            // check custom field
            request(server)
              .get('/user/customfields')
              .set('Authorization', 'Basic bXl1c2VybmFtZTpNeVBhc3N3b3Jk')
              .send()
              .expect(200, {
                admin: 0,
                daysback: null,
                emergcontact: null,
                favoritecount: null,
                phone: 694165516
              }, done);
          });
      });
  });

  it('denies empty custom fields', function testUserCustomInvalidy(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/user/customfields')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(400, done);
      });
  });

  it('denies invalid custom fields', function testUserCustomInvalid(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/user/customfields')
          .set('Authorization', 'Basic bXl1c2VybmFtZTpNeVBhc3N3b3Jk')
          .set('Content-Type', 'application/json')
          .send('{"notafield": "value"}')
          .expect(400, done);
      });
  });
});
