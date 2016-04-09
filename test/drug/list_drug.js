/* globals it,describe,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('drug list', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('retrieves unique drug list', function testDrugList(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make a drug
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
            // make another drug
            request(server)
              .post('/drug')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"name": "Ibuprofen",' +
                '"unit": "mg",' +
                '"notes": "Ibuprofen is a painkiller",' +
                '"classification": "COX inhibitor",' +
                '"family": "NSAID",' +
                '"rarity": "Common"' +
                '}')
              .end(function() {
                request(server)
                  .get('/drug/all')
                  .auth('myusername', 'MyPassword')
                  .expect(200, [{
                    "id": 2,
                    "name": "Ibuprofen",
                    "unit": "mg",
                    "notes": "Ibuprofen is a painkiller",
                    "classification": "COX inhibitor",
                    "family": "NSAID",
                    "rarity": "Common",
                    "slang": null,
                    "use_count": 0,
                    "owner": 1
                  }, {
                    "id": 1,
                    "name": "Phenylpiracetam",
                    "unit": "mg",
                    "notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",
                    "classification": "AMPA modulator",
                    "family": "*racetam",
                    "rarity": "Common",
                    "slang": null,
                    "use_count": 0,
                    "owner": 1
                  }], done);
              });
          });
      });
  });
});
