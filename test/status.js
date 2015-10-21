process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('loading express', function () {
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
    .expect(200, {
      up: true
    },done);
  });

  it('has the correct number of db tables', function testDB(done) {
    request(server)
      .get('/status/db')
      .expect(200, {
        rowcount: 4
      }, done);
  });
});
