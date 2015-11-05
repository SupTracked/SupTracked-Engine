/* globals it,describe,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('drug update', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('updates a valid drug', function testDrugUpdate(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create a new drug
        request(server)
          .post('/drug')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Phenylpiracetam",' +
            '"unit": "mg",' +
            '"notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",' +
            '"classification": "AMPA modulator",' +
            '"family": "*racetam",' +
            '"rarity": "Common"' +
            '}')
          .end(function() {
            // edit that drug
            request(server)
              .put('/drug')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1, "unit": "grains"}')
              .end(function() {
                // request and check that it was updated
                request(server)
                  .get('/drug/1')
                  .auth('myusername', 'MyPassword')
                  .expect(200, {
                    "id": 1,
                    "name": "Phenylpiracetam",
                    "unit": "grains",
                    "notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",
                    "classification": "AMPA modulator",
                    "family": "*racetam",
                    "rarity": "Common",
                    "owner": 1
                  }, done);
              });
          });
      });
  });

  it('denies update on another user', function testDrugUpdateOtherUser(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/register')
          .set('Content-Type', 'application/json')
          .send('{"username": "myotherusername", "password": "MyPassword"}')
          .end(function() {
            // create a new drug
            request(server)
              .post('/drug')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"name": "Phenylpiracetam",' +
                '"unit": "mg",' +
                '"notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",' +
                '"classification": "AMPA modulator",' +
                '"family": "*racetam",' +
                '"rarity": "Common"' +
                '}')
              .end(function() {
                // edit that drug
                request(server)
                  .put('/drug')
                  .auth('myotherusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1, "unit": "grains"}')
                  .expect(404, done);
              });
          });
      });
  });

  it('denies drug update with an invalid field', function testDrugUpdateInvalid(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create a new drug
        request(server)
          .post('/drug')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Phenylpiracetam",' +
            '"unit": "mg",' +
            '"notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",' +
            '"classification": "AMPA modulator",' +
            '"family": "*racetam",' +
            '"rarity": "Common"' +
            '}')
          .end(function() {
            // edit that drug
            request(server)
              .put('/drug')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1, "notafield": "value"}')
              .expect(400, {
                "drug": "custom field requested that is not permitted"
              }, done);
          });
      });
  });
});
