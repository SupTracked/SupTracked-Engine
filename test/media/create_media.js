/* globals it,describe,beforeEach,afterEach,before,after */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');
var rimraf = require('rimraf');
var config = require('../../data/config');
var mkdirp = require('mkdirp');

describe('media create', function() {
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

  function isBigEnough(res) {
    if (res.header['content-length'] !== 6769908) {
      return "file not big enough";
    }
  }

  it('requests authorization', function testMediaAuthReq(done) {
    request(server)
      .post('/media')
      .expect(401, done);
  });

  it('denies missing fields', function testMediaMissingFields(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/media')
          .auth('myusername', 'MyPassword')
          .expect(400, {
            "media": "file, title, notes, association_type, and association required"
          }, done);
      });
  });

  it('denies missing file', function testMediaMissingFile(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/media')
          .auth('myusername', 'MyPassword')
          .field('title', 'My Pic')
          .field('association_type', 'drug')
          .field('assocation', 1)
          .expect(400, {
            "media": "file, title, notes, association_type, and association required"
          }, done);
      });
  });

  it('denies invalid association_type', function testMediaBadAssociationType(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/media')
          .auth('myusername', 'MyPassword')
          .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
          .field('title', 'My Pic')
          .field('association_type', 'bad')
          .field('association', '1')
          .expect(400, {
            "media": "association_type was not 'drug' or 'experience'"
          }, done);
      });
  });

  it('denies invalid association', function testMediaBadAssociation(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/media')
          .auth('myusername', 'MyPassword')
          .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
          .field('title', 'My Pic')
          .field('association_type', 'drug')
          .field('association', '1')
          .expect(400, {
            "media": "association not found"
          }, done);
      });
  });

  it('creates a valid media object', function testMediaCreation(done) {
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
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('date', 1445995224)
              .expect(201, {
                "id": 1
              }, done);
          });
      });
  });

  it('retrieves a valid media object', function testMediaRetrieval(done) {
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
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('date', 1445995224)
              .end(function() {
                request(server)
                  .get('/media/1')
                  .auth('myusername', 'MyPassword')
                  .expect(200, {
                    id: 1,
                    title: 'My Pic',
                    tags: 'test tag',
                    date: '1445995224',
                    association_type: 'drug',
                    association: 1,
                    explicit: 0,
                    favorite: 0,
                    owner: 1
                  }, done);
              });
          });
      });
  });

  it('retrieves a valid media file', function testMediaFileRetrieval(done) {
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
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('date', 1445995224)
              .end(function() {
                request(server)
                  .get('/media/file/1')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .expect(isBigEnough)
                  .expect(200, done);
              });
          });
      });
  });

  it('refuses to retrieve a non-owned media file', function testMediaFileRetrievalBadOwner(done) {
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
                  .post('/media')
                  .auth('myusername', 'MyPassword')
                  .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                  .field('title', 'My Pic')
                  .field('association_type', 'drug')
                  .field('association', '1')
                  .field('tags', 'test tag')
                  .field('date', 1445995224)
                  .end(function() {
                    request(server)
                      .get('/media/file/1')
                      .auth('myotherusername', 'MyPassword')
                      .expect(404, done);
                  });
              });
          });
      });
  });
});
