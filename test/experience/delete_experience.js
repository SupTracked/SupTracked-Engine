/* globals it,describe,beforeEach,afterEach,before,after */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');
var rimraf = require('rimraf');
var config = require('../../config');
var mkdirp = require('mkdirp');

describe('experience delete', function() {
  var server;

  before(function(done) {
    mkdirp(config.media.test_location, done);
  });

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  after(function(done) {
    rimraf(config.media.test_location, done);
  });

  it('deletes an experience', function testExperienceDeletion(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make the experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // delete the experience
            request(server)
              .delete('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"id": 1}')
              .end(function() {
                request(server)
                  .get('/experience')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1}')
                  .expect(404, done);
              });
          });
      });
  });

  it('refuses delete on another user', function testExperienceDeletionOtherUser(done) {
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
            // make the experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "date": 1445543583}')
              .end(function() {
                // delete the experience
                request(server)
                  .delete('/experience')
                  .auth('myotherusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1}')
                  .expect(404, done);
              });
          });
      });
  });

  it('refuses delete with media', function testExperienceDeletionWithUser(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make the experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            request(server)
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Pic')
              .field('association_type', 'experience')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('date', 1445995224)
              .end(function() {
                // delete the experience
                request(server)
                  .delete('/experience')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1}')
                  .expect(400, {"experience": "Media associated; please remove before deleting the experience"}, done);
              });
          });
      });
  });

  it('refuses to delete without ID', function testExperienceDeletionNoID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make the experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // delete the experience
            request(server)
              .delete('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .expect(400, {
                "experience": "id must be provided"
              }, done);
          });
      });
  });

  it('refuses to delete bad ID', function testExperienceDeletionBadID(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // make the experience
        request(server)
          .post('/experience')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"title": "My Title", "date": 1445543583}')
          .end(function() {
            // delete the experience
            request(server)
              .delete('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .set('Content-Type', 'application/json')
              .send('{"id": 99}')
              .expect(404, done);
          });
      });
  });

  it('deletes consumptions underneath an experience', function testExperienceDeletesSub(done) {
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
                // make a method
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
                      .send('{"count": 2, "experience_id": 1, "date": 1445648036, "drug_id": 1, "method_id": 1}')
                      .end(function() {
                        // delete the experience
                        request(server)
                          .delete('/experience')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"id": 1}')
                          .end(function() {
                            // request the consumption
                            request(server)
                              .get('/consumption')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"id": 1}')
                              .expect(404, done);
                          });
                      });
                  });
              });
          });
      });
  });
});
