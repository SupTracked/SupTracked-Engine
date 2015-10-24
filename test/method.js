process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('method', function() {
  var server;

  beforeEach(function() {
    server = require('../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('requests authorization', function testMethodAuthReq(done) {
    request(server)
      .post('/method')
      .expect(401, done);
  });

  it('denies missing JSON', function testMethodMissingJSON(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/method')
          .auth('myusername', 'MyPassword')
          .expect(400, {
            "method": "name and icon required"
          }, done);
      });
  });

  it('404s on no such ID', function testMethodNoSuchID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .get('/method')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"id": 1}')
          .expect(404, done);
      });
  });

  it('denies missing fields', function testMethodMissing(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/method')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .expect(400, {
            "method": "name and icon required"
          }, done);
      });
  });

  it('creates a valid method', function testMethodCreation(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/method')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Oral",' +
            '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
            '}')
            .expect(201, {
            "id": 1
          }, done);
      });
  });

  it('retrieves a valid method', function testMethodRetrieval(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/method')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Oral",' +
            '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
            '}')
          .end(function() {
            request(server)
              .get('/method')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1}')
              .expect(200, {
                "id": 1,
                "name": "Oral",
                "icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
                "owner": 1
              }, done);
          });
      });
  });

  it('updates a valid method', function testMethodUpdate(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create a new method
        request(server)
          .post('/method')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Oral",' +
            '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
            '}')
          .end(function() {
            // edit that method
            request(server)
              .put('/method')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1, "name": "Mouth"}')
              .end(function() {
                // request and check that it was updated
                request(server)
                  .get('/method')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1}')
                  .expect(200, {
                    "id": 1,
                    "name": "Oral",
                    "icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
                    "owner": 1
                  }, done);
              });
          });
      });
  });

  it('denies method update with an invalid field', function testMethodUpdateInvalid(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // create a new method
        request(server)
          .post('/method')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Oral",' +
            '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",' +
            '}')
          .end(function() {
            // edit that method
            request(server)
              .put('/method')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1, "notafield": "value"}')
              .expect(400, {
                "method": "custom field requested that is not permitted"
              }, done);
          });
      });
  });

  it('deletes a method', function testDrugDeletion(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
          request(server)
          .post('/method')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Oral",' +
            '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
            '}')
          .end(function(){
            request(server)
              .delete('/method')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1}')
              .end(function(){
                request(server)
                  .get('/method')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1}')
                  .expect(404, done);
              });
          });
      });
  });

  it('refuses delete on no ID', function testMethodDeletionNoID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function(){
        request(server)
          .delete('/method')
          .auth('myusername', 'MyPassword')
          .expect(400, {"method": "id must be provided"}, done);
      });
  });

  it('refuses delete on no such ID', function testMethodDeletionNoSuchID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function(){
        request(server)
          .delete('/method')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"id": 1}')
          .expect(404, done);
      });
  });

  it('refuses deletion on a method used in a consumption', function testMethodDeletionInUse(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make an experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
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
                // add method
                request(server)
                  .post('/method')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"name": "Oral",' +
                    '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
                    '}')
                  .end(function() {
                    // add consumption
                    request(server)
                      .post('/consumption')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"count": 2, "experience_id": 1, "date": 1445648036, "drug_id": 1, "method_id": 1, "location": "My Location"}')
                      .end(function(){
                        request(server)
                          .delete('/method')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"id": 1}')
                          .expect(400, {
                            "consumptions": [
                              {
                                "count": 2,
                                "date": "1445648036",
                                "drug_id": 1,
                                "experience_id": 1,
                                "location": "My Location", 
                                "id": 1,
                                "method_id": 1,
                                "owner": 1
                              }
                            ],
                            "method": "method in use"
                          }, done);
                      });
                  });
              });
          });
      });
  });
});
