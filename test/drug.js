process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('drug', function() {
  var server;

  beforeEach(function() {
    server = require('../bin/www', {
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
          .set('Content-Type', 'application/json')
          .send('{"id": 1}')
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

  it('denies missing fields', function testDrugMissing(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/drug')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
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
            '"rarity": "Common"' +
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
            '"rarity": "Common"' +
            '}')
          .end(function() {
            request(server)
              .get('/drug')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1}')
              .expect(200, {
                "id": 1,
                "name": "Phenylpiracetam",
                "unit": "mg",
                "notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",
                "classification": "AMPA modulator",
                "family": "*racetam",
                "rarity": "Common",
                "owner": 1
              }, done);
          });
      });
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
                  .get('/drug')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1}')
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

  it('deletes a drug', function testDrugDeletion(done) {
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
            '"rarity": "Common"' +
            '}')
          .end(function(){
            request(server)
              .delete('/drug')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1}')
              .end(function(){
                request(server)
                  .get('/drug')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1}')
                  .expect(404, done);
              });
          });
      });
  });

  it('refuses delete on no ID', function testDrugDeletionNoID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function(){
        request(server)
          .delete('/drug')
          .auth('myusername', 'MyPassword')
          .expect(400, {"drug": "id must be provided"}, done);
      });
  });

  it('refuses delete on no such ID', function testDrugDeletionNoSuchID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function(){
        request(server)
          .delete('/drug')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"id": 1}')
          .expect(404, done);
      });
  });
});
