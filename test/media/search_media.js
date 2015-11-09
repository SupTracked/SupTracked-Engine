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

describe('media search', function() {
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

  it('404s on no results', function testMediaSearch404(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          .post('/media/search')
          .auth('myusername', 'MyPassword')
          .expect(404, done);
      });
  });

  it('returns all results with no criteria', function testMediaSearchNoCriteria(done) {
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
              .send('{"name": "Aspirin",' +
                '"unit": "mg",' +
                '"notes": "Painkiller",' +
                '"classification": "COXi",' +
                '"family": "NSAID",' +
                '"rarity": "Common"' +
                '}')
              .end(function() {
                // associate it with drug 1
                request(server)
                  .post('/media')
                  .auth('myusername', 'MyPassword')
                  .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                  .field('title', 'My Pic')
                  .field('association_type', 'drug')
                  .field('association', '1')
                  .field('tags', 'test tag')
                  .field('date', 1445985224)
                  .end(function() {
                    // associate it with drug 2
                    request(server)
                      .post('/media')
                      .auth('myusername', 'MyPassword')
                      .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                      .field('title', 'My Other Pic')
                      .field('association_type', 'drug')
                      .field('association', '2')
                      .field('tags', 'test tag')
                      .field('date', 1445995224)
                      .end(function() {
                        request(server)
                          .post('/media/search')
                          .auth('myusername', 'MyPassword')
                          .expect(200, [{
                            id: 2,
                            title: 'My Other Pic',
                            tags: 'test tag',
                            date: '1445995224',
                            association_type: 'drug',
                            association: 2,
                            explicit: 0,
                            favorite: 0,
                            owner: 1
                          }, {
                            id: 1,
                            title: 'My Pic',
                            tags: 'test tag',
                            date: '1445985224',
                            association_type: 'drug',
                            association: 1,
                            explicit: 0,
                            favorite: 0,
                            owner: 1
                          }], done);
                      });
                  });
              });
          });
      });
  });

  it('searches on drug association', function testMediaSearchDrug(done) {
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
              .send('{"name": "Aspirin",' +
                '"unit": "mg",' +
                '"notes": "Painkiller",' +
                '"classification": "COXi",' +
                '"family": "NSAID",' +
                '"rarity": "Common"' +
                '}')
              .end(function() {
                // associate it with drug 1
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
                    // associate it with drug 2
                    request(server)
                      .post('/media')
                      .auth('myusername', 'MyPassword')
                      .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                      .field('title', 'My Other Pic')
                      .field('association_type', 'drug')
                      .field('association', '2')
                      .field('tags', 'test tag')
                      .field('date', 1445995224)
                      .end(function() {
                        request(server)
                          .post('/media/search')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"association_type": "drug", "association": 1}')
                          .expect(200, [{
                            id: 1,
                            title: 'My Pic',
                            tags: 'test tag',
                            date: '1445995224',
                            association_type: 'drug',
                            association: 1,
                            explicit: 0,
                            favorite: 0,
                            owner: 1
                          }], done);
                      });
                  });
              });
          });
      });
  });

  it('searches on experience association', function testMediaSearchExperience(done) {
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
          .send('{"title": "My First Title", "date": 1445543583}')
          .end(function() {
            // make another experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Other Title", "date": 1445543583}')
              .end(function() {
                // associate it with experience 1
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
                    // associate it with experience 2
                    request(server)
                      .post('/media')
                      .auth('myusername', 'MyPassword')
                      .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                      .field('title', 'My Other Pic')
                      .field('association_type', 'experience')
                      .field('association', '2')
                      .field('tags', 'test tag')
                      .field('date', 1445995224)
                      .end(function() {
                        request(server)
                          .post('/media/search')
                          .auth('myusername', 'MyPassword')
                          .set('Content-Type', 'application/json')
                          .send('{"association_type": "experience", "association": 1}')
                          .expect(200, [{
                            id: 1,
                            title: 'My Pic',
                            tags: 'test tag',
                            date: '1445995224',
                            association_type: 'experience',
                            association: 1,
                            explicit: 0,
                            favorite: 0,
                            owner: 1
                          }], done);
                      });
                  });
              });
          });
      });
  });

  it('searches on date', function testMediaSearchDate(done) {
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
            // earlier date
            request(server)
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('explicit', 1)
              .field('date', 1440000000)
              .end(function() {
                // later date
                request(server)
                  .post('/media')
                  .auth('myusername', 'MyPassword')
                  .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                  .field('title', 'My Other Pic')
                  .field('association_type', 'drug')
                  .field('association', '1')
                  .field('tags', 'test tag')
                  .field('date', 1460000000)
                  .end(function() {
                    request(server)
                      .post('/media/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"startdate": 1430000000, "enddate": 1450000000}')
                      .expect(200, [{
                        id: 1,
                        title: 'My Pic',
                        tags: 'test tag',
                        date: '1440000000',
                        association_type: 'drug',
                        association: 1,
                        explicit: 1,
                        favorite: 0,
                        owner: 1
                      }], done);
                  });
              });
          });
      });
  });

  it('searches on explicit', function testMediaSearchExplicit(done) {
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
            // explicit
            request(server)
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('explicit', 1)
              .field('date', 1440000000)
              .end(function() {
                request(server)
                  .post('/media')
                  .auth('myusername', 'MyPassword')
                  .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                  .field('title', 'My Other Pic')
                  .field('association_type', 'drug')
                  .field('association', '1')
                  .field('tags', 'test tag')
                  .field('date', 1460000000)
                  .end(function() {
                    request(server)
                      .post('/media/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"explicit": 1}')
                      .expect(200, [{
                        id: 1,
                        title: 'My Pic',
                        tags: 'test tag',
                        date: '1440000000',
                        association_type: 'drug',
                        association: 1,
                        explicit: 1,
                        favorite: 0,
                        owner: 1
                      }], done);
                  });
              });
          });
      });
  });

  it('searches on favorite', function testMediaSearchFavorite(done) {
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
            // favorite
            request(server)
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('favorite', 1)
              .field('date', 1440000000)
              .end(function() {
                request(server)
                  .post('/media')
                  .auth('myusername', 'MyPassword')
                  .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                  .field('title', 'My Other Pic')
                  .field('association_type', 'drug')
                  .field('association', '1')
                  .field('tags', 'test tag')
                  .field('date', 1460000000)
                  .end(function() {
                    request(server)
                      .post('/media/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"favorite": 1}')
                      .expect(200, [{
                        id: 1,
                        title: 'My Pic',
                        tags: 'test tag',
                        date: '1440000000',
                        association_type: 'drug',
                        association: 1,
                        explicit: 0,
                        favorite: 1,
                        owner: 1
                      }], done);
                  });
              });
          });
      });
  });

  it('searches on tag', function testMediaSearchTag(done) {
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
            // has tags
            request(server)
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('favorite', 1)
              .field('date', 1440000000)
              .end(function() {
                request(server)
                  .post('/media')
                  .auth('myusername', 'MyPassword')
                  .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                  .field('title', 'My Other Pic')
                  .field('association_type', 'drug')
                  .field('association', '1')
                  .field('tags', 'notme')
                  .field('date', 1460000000)
                  .end(function() {
                    request(server)
                      .post('/media/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"tags": "test"}')
                      .expect(200, [{
                        id: 1,
                        title: 'My Pic',
                        tags: 'test tag',
                        date: '1440000000',
                        association_type: 'drug',
                        association: 1,
                        explicit: 0,
                        favorite: 1,
                        owner: 1
                      }], done);
                  });
              });
          });
      });
  });

  it('searches on title', function testMediaSearchTitle(done) {
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
            request(server)
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Cool Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('favorite', 1)
              .field('date', 1440000000)
              .end(function() {
                request(server)
                  .post('/media')
                  .auth('myusername', 'MyPassword')
                  .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                  .field('title', 'My Other Pic')
                  .field('association_type', 'drug')
                  .field('association', '1')
                  .field('tags', 'notme')
                  .field('date', 1460000000)
                  .end(function() {
                    request(server)
                      .post('/media/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"title": "Cool"}')
                      .expect(200, [{
                        id: 1,
                        title: 'My Cool Pic',
                        tags: 'test tag',
                        date: '1440000000',
                        association_type: 'drug',
                        association: 1,
                        explicit: 0,
                        favorite: 1,
                        owner: 1
                      }], done);
                  });
              });
          });
      });
  });

  it('limits search results', function testMediaSearchLimit(done) {
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
            request(server)
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Cool Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('favorite', 1)
              .field('date', 1440000000)
              .end(function() {
                request(server)
                  .post('/media')
                  .auth('myusername', 'MyPassword')
                  .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                  .field('title', 'My Other Pic')
                  .field('association_type', 'drug')
                  .field('association', '1')
                  .field('tags', 'notme')
                  .field('date', 1460000000)
                  .end(function() {
                    request(server)
                      .post('/media/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"limit": 1}')
                      .expect(200, [{
                        id: 2,
                        title: 'My Other Pic',
                        tags: 'notme',
                        date: '1460000000',
                        association_type: 'drug',
                        association: 1,
                        explicit: 0,
                        favorite: 0,
                        owner: 1
                      }], done);
                  });
              });
          });
      });
  });

  it('offsets search results', function testMediaSearchOffset(done) {
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
            request(server)
              .post('/media')
              .auth('myusername', 'MyPassword')
              .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
              .field('title', 'My Cool Pic')
              .field('association_type', 'drug')
              .field('association', '1')
              .field('tags', 'test tag')
              .field('favorite', 1)
              .field('date', 1440000000)
              .end(function() {
                request(server)
                  .post('/media')
                  .auth('myusername', 'MyPassword')
                  .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                  .field('title', 'My Other Pic')
                  .field('association_type', 'drug')
                  .field('association', '1')
                  .field('tags', 'notme')
                  .field('date', 1460000000)
                  .end(function() {
                    request(server)
                      .post('/media/search')
                      .auth('myusername', 'MyPassword')
                      .set('Content-Type', 'application/json')
                      .send('{"limit": 1, "offset": 1}')
                      .expect(200, [{
                        id: 1,
                        title: 'My Cool Pic',
                        tags: 'test tag',
                        date: '1440000000',
                        association_type: 'drug',
                        association: 1,
                        explicit: 0,
                        favorite: 1,
                        owner: 1
                      }], done);
                  });
              });
          });
      });
  });
});
