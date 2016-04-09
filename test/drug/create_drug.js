/* globals it,describe,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('drug create', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('requests authorization', function testDrugAuthReq(done) {
    request(server)
      .post('/drug')
      .expect(401, done);
  });

  it('404s drugs with no such ID missing', function testDrugNoSuchID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/drug')
          .auth('myusername', 'MyPassword')
          .expect(404, done);
      });
  });

  it('denies missing JSON', function testDrugMissingJSON(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/drug')
          .auth('myusername', 'MyPassword')
          .expect(400, {
            "drug": "name, unit, notes, classification, family, and rarity required"
          }, done);
      });
  });

  it('creates a valid drug', function testDrugCreation(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/drug')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Phenylpiracetam",' +
            '"unit": "mg",' +
            '"notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",' +
            '"classification": "AMPA modulator",' +
            '"family": "*racetam",' +
            '"rarity": "Common",' +
            '"slang": "Something"' +
            '}')
          .expect(201, {
            "id": 1
          }, done);
      });
  });

  it('retrieves a valid drug', function testDrugRetrieval(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/drug')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Phenylpiracetam",' +
            '"unit": "mg",' +
            '"notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",' +
            '"classification": "AMPA modulator",' +
            '"family": "*racetam",' +
            '"rarity": "Common",' +
            '"slang": "Something"' +
            '}')
          .end(function() {
            request(server)
              .get('/drug/1')
              .auth('myusername', 'MyPassword')
              .expect(200, {
                "id": 1,
                "name": "Phenylpiracetam",
                "unit": "mg",
                "notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",
                "classification": "AMPA modulator",
                "family": "*racetam",
                "rarity": "Common",
                "slang": "Something",
                "owner": 1
              }, done);
          });
      });
  });
});
