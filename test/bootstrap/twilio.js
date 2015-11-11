/* globals it,describe,after,before,beforeEach,afterEach */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');
var rimraf = require('rimraf');
var config = require('../../config');
var mkdirp = require('mkdirp');

describe('twilio', function() {
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

  function isValidMedia(res) {
    if (res.body.id !== 1 ||
      res.body.title.indexOf("SMS Upload ") !== 0 ||
      res.body.association_type !== "experience" ||
      res.body.association !== 1 ||
      res.body.owner !== 1) {
      return true;
    }
  }

  function isBigEnough(res) {
    if (res.header['content-length'] < 168) {
      return "file not big enough";
    }
  }

  function mediaHasNewName(res) {
    if (res.text.indexOf('<?xml version="1.0" encoding="UTF-8"?><Response><Message>Media renamed from SMS Upload') > 0) {
      return true;
    }

    if (res.text.indexOf('newname.</Message></Response>') < 0) {
      return true;
    }
  }

  it('rejects with no body', function testTwilioNoBody(done) {
    request(server)
      .get('/twilio')
      .expect(400, done);
  });

  it('rejects with no from field', function testTwilioNoFrom(done) {
    request(server)
      .get('/twilio')
      .field('notphone', '0')
      .expect(400, done);
  });

  it('denies with no matching number', function testTwilioBadNumber(done) {
    request(server)
      .get('/twilio?From=%2B15551234&Body=commands')
      .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Ambiguous or no such user</Message></Response>', done);
  });

  it('returns the command list', function testTwilioCommands(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .get('/twilio?From=%2B15551234&Body=commands')
              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>listcon, setcount, dupcon, jumpcon, namemedia</Message></Response>', done);
          });
      });
  });

  it('rejects file upload without an experience', function testTwilioNoExperience(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .get('/twilio?From=%2B15551234&NumMedia=1&MediaUrl0=https%3A%2F%2Fplaceholdit.imgix.net%2F~text%3Ftxtsize%3D33%26txt%3D350%25C3%2597150%26w%3D350%26h%3D150%26fm%3Djpg')
              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No experiences to add to!</Message></Response>', done);
          });
      });
  });

  it('uploads a file', function testTwilioUpload(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&NumMedia=1&MediaUrl0=https%3A%2F%2Fplaceholdit.imgix.net%2F~text%3Ftxtsize%3D33%26txt%3D350%25C3%2597150%26w%3D350%26h%3D150%26fm%3Djpg')
                  .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Processed 1 object.</Message></Response>', done);
              });
          });
      });
  });

  it('verifies a file upload object', function testTwilioUploadVerify(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&NumMedia=1&MediaUrl0=https%3A%2F%2Fplaceholdit.imgix.net%2F~text%3Ftxtsize%3D33%26txt%3D350%25C3%2597150%26w%3D350%26h%3D150%26fm%3Djpg')
                  .end(function() {
                    request(server)
                      .get('/media/1')
                      .auth('myusername', 'MyPassword')
                      .expect(isValidMedia)
                      .expect(200, done);
                  });
              });
          });
      });
  });

  it('verifies a file upload file', function testTwilioUploadVerifyFile(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&NumMedia=1&MediaUrl0=https%3A%2F%2Fplaceholdit.imgix.net%2F~text%3Ftxtsize%3D33%26txt%3D350%25C3%2597150%26w%3D350%26h%3D150%26fm%3Djpg')
                  .end(function() {
                    request(server)
                      .get('/media/1')
                      .auth('myusername', 'MyPassword')
                      .expect(isBigEnough)
                      .expect(200, done);
                  });
              });
          });
      });
  });

  it('uploads multiple images', function testTwilioUploadVerifyMultiple(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&NumMedia=2&MediaUrl0=https%3A%2F%2Fplaceholdit.imgix.net%2F~text%3Ftxtsize%3D33%26txt%3D350%25C3%2597150%26w%3D350%26h%3D150%26fm%3Djpg&MediaUrl1=https%3A%2F%2Fplaceholdit.imgix.net%2F~text%3Ftxtsize%3D33%26txt%3D350%25C3%2597150%26w%3D350%26h%3D150%26fm%3Djpg')
                  .end(function() {
                    request(server)
                      .get('/media/1')
                      .auth('myusername', 'MyPassword')
                      .expect(isValidMedia)
                      .expect(200)
                      .end(function() {
                        request(server)
                          .get('/media/2')
                          .auth('myusername', 'MyPassword')
                          .expect(isValidMedia)
                          .expect(200, done);
                      });
                  });
              });
          });
      });
  });

  it('lists no consumptions with no experiences', function testTwilioListNoConNoExp(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .get('/twilio?From=%2B15551234&Body=listcon')
              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No experiences to add to!</Message></Response>', done);
          });
      });
  });

  it('lists no consumptions', function testTwilioListNoCon(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            // make an experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&Body=listcon')
                  .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No consumptions!</Message></Response>', done);
              });
          });
      });
  });


  it('lists consumptions', function testTwilioListCon(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            // make an experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                          .end(function() {
                            // add another consumption
                            request(server)
                              .post('/consumption')
                              .auth('myusername', 'MyPassword')
                              .set('Content-Type', 'application/json')
                              .send('{"count": 6, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                              .end(function() {
                                request(server)
                                  .get('/twilio?From=%2B15551234&Body=listcon')
                                  .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>1: 2 mg Phenylpiracetam, 2: 6 mg Phenylpiracetam</Message></Response>', done);
                              });
                          });
                      });
                  });
              });
          });
      });
  });

  it('refuses to set consumption count on nonexistent exp', function testTwilioSetCountNoExp(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .get('/twilio?From=%2B15551234&Body=setcount%201%205')
              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No experiences!</Message></Response>', done);
          });
      });
  });

  it('refuses to set consumption count on nonexistent con', function testTwilioSetCountNoCon(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&Body=setcount%205')
                  .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No consumptions!</Message></Response>', done);
              });
          });
      });
  });

  it('sets consumption count', function testTwilioSetCount(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            // make an experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                          .end(function() {
                            request(server)
                              .get('/twilio?From=%2B15551234&Body=setcount%205')
                              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Updated from 2 to 5 </Message></Response>', done);
                          });
                      });
                  });
              });
          });
      });
  });

  it('verifies set consumption count', function testTwilioSetCountVerify(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            // make an experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                          .end(function() {
                            request(server)
                              .get('/twilio?From=%2B15551234&Body=setcount%205')
                              .end(function() {
                                request(server)
                                  .get('/twilio?From=%2B15551234&Body=listcon')
                                  .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>1: 5 mg Phenylpiracetam</Message></Response>', done);
                              });
                          });
                      });
                  });
              });
          });
      });
  });

  it('refuses to duplicate consumption count on nonexistent exp', function testTwilioDupNoExp(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .get('/twilio?From=%2B15551234&Body=dupcon')
              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No experiences!</Message></Response>', done);
          });
      });
  });

  it('refuses to duplicate consumption count on nonexistent con', function testTwilioDupNoCon(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&Body=dupcon')
                  .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No consumptions!</Message></Response>', done);
              });
          });
      });
  });

  it('duplicates a consumption', function testTwilioDup(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            // make an experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                          .end(function() {
                            request(server)
                              .get('/twilio?From=%2B15551234&Body=dupcon')
                              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Duplicated consumption.</Message></Response>', done);
                          });
                      });
                  });
              });
          });
      });
  });

  it('verifies duplicate consumption', function testTwilioDupVerify(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            // make an experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                          .end(function() {
                            request(server)
                              .get('/twilio?From=%2B15551234&Body=dupcon')
                              .end(function() {
                                request(server)
                                  .get('/twilio?From=%2B15551234&Body=listcon')
                                  .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>1: 2 mg Phenylpiracetam, 2: 2 mg Phenylpiracetam</Message></Response>', done);
                              });
                          });
                      });
                  });
              });
          });
      });
  });

  it('refuses to jump consumption count on nonexistent exp', function testTwilioJumpNoExp(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .get('/twilio?From=%2B15551234&Body=jumpcon')
              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No experiences!</Message></Response>', done);
          });
      });
  });

  it('refuses to jump consumption count on nonexistent con', function testTwilioJumpNoCon(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&Body=jumpcon')
                  .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No consumptions!</Message></Response>', done);
              });
          });
      });
  });

  it('jumps a consumption', function testTwilioJump(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            // make an experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
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
                          .send('{"count": 2, "experience_id": 1, "date": 1445648036, "location": "San Juan", "drug_id": 1, "method_id": 1}')
                          .end(function() {
                            request(server)
                              .get('/twilio?From=%2B15551234&Body=jumpcon')
                              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Date jumped.</Message></Response>', done);
                          });
                      });
                  });
              });
          });
      });
  });

  it('refuses to rename media with no media', function testTwilioRenameNoMedia(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .get('/twilio?From=%2B15551234&Body=namemeda%20newname')
              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No experiences!</Message></Response>', done);
          });
      });
  });

  it('renames media', function testTwilioRename(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&NumMedia=1&MediaUrl0=https%3A%2F%2Fplaceholdit.imgix.net%2F~text%3Ftxtsize%3D33%26txt%3D350%25C3%2597150%26w%3D350%26h%3D150%26fm%3Djpg')
                  .end(function() {
                    request(server)
                      .get('/twilio?From=%2B15551234&Body=namemeda%20newname')
                      .expect(200)
                      .expect(mediaHasNewName)
                      .end(done);
                  });
              });
          });
      });
  });

  it('refuses to add note with no experience', function testTwilioNoteNoExp(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            request(server)
              .get('/twilio?From=%2B15551234&Body=newnote')
              .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No experiences!</Message></Response>', done);
          });
      });
  });

  it('adds a note', function testTwilioNote(done) {
    // make user
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        // set phone
        request(server)
          .put('/user')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"phone": "+15551234"}')
          .end(function() {
            // make an experience
            request(server)
              .post('/experience')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"title": "My Title", "location": "My Location", "date": 1445543583}')
              .end(function() {
                request(server)
                  .get('/twilio?From=%2B15551234&Body=newnote')
                  .expect(200, '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Note added.</Message></Response>', done);
              });
          });
      });
  });
});
