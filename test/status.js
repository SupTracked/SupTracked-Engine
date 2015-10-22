process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('startup', function () {
  var server;

  beforeEach(function () {
    server = require('../bin/www', {bustCache: true});
  });

  afterEach(function (done) {
    server.close(done);
  });

  it('is up', function testSlash(done) {
  request(server)
    .get('/status/up')
    .expect(200, done);
  });

  it('runs the database', function testDB(done) {
    request(server)
      .get('/status/db')
      .expect(200, {
        online: true,
        tables: 4
      }, done);
  });
});
