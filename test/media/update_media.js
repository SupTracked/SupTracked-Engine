process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');
var rimraf = require('rimraf');
var config = require('../../config');
var mkdirp = require('mkdirp');

describe('media update', function() {
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

  it('updates a valid media object', function testMediaUpdate(done) {
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
                  .put('/media')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1, "title": "My Different Title"}')
                  .end(function() {
                    request(server)
                      .get('/media')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"id": 1}')
                      .expect(200, {
                        id: 1,
                        title: 'My Different Title',
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
  });

  it('denies update on another user', function testMediaUpdateOtherUser(done) {
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
                      .put('/media')
                      .auth('myotherusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"id": 1, "title": "My Different Title"}')
                      .expect(404, done);
                  });
              });
          });
      });
  });

  it('denies update on an invalid field', function testMediaUpdateBadField(done) {
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
                  .put('/media')
                  .auth('myusername', 'MyPassword')
                  .set('Content-Type', 'application/json')
                  .send('{"id": 1, "badfield": "wat"}')
                  .expect(400, {"media": "custom field requested that is not permitted"}, done);
              });
          });
      });
  });
});
