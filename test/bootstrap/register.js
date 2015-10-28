/* globals it,describe,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('register', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
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
      .expect(400, {
        "userpass": "username must be at least five characters and alphanumeric; password must be at least ten characters"
      }, done);
  });

  it('catches bad usernames', function testBadUser(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "!!!!", "password": "MyPassword"}')
      .expect(400, {
        "userpass": "username must be at least five characters and alphanumeric; password must be at least ten characters"
      }, done);
  });

  it('catches short passwords', function testShortPass(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "short"}')
      .expect(400, {
        "userpass": "username must be at least five characters and alphanumeric; password must be at least ten characters"
      }, done);
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
          .expect(409, {
            "username": "username is already taken"
          }, done);
      });
  });
});
