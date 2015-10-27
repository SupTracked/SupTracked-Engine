process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');

describe('method list', function() {
  var server;

  beforeEach(function() {
    server = require('../../bin/www', {
      bustCache: true
    });
  });

  afterEach(function(done) {
    server.close(done);
  });

  it('retrieves a unique method list', function testMethodList(done) {
    request(server)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send('{"username": "myusername", "password": "MyPassword"}')
      .end(function() {
        request(server)
          // make a method
          .post('/method')
          .auth('myusername', 'MyPassword')
          .set('Content-Type', 'application/json')
          .send('{"name": "Oral",' +
            '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
            '}')
          .end(function() {
            request(server)
              // make another method
              .post('/method')
              .auth('myusername', 'MyPassword')
              .set('Content-Type', 'application/json')
              .send('{"name": "Bucal",' +
                '"icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="' +
                '}')
              .end(function() {
                request(server)
                  .get('/method/all')
                  .auth('myusername', 'MyPassword')
                  .expect(200, [{
                    "id": 1,
                    "name": "Oral",
                    "icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
                    "use_count": 0,
                    "owner": 1
                  }, {
                    "id": 2,
                    "name": "Bucal",
                    "icon": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
                    "use_count": 0,
                    "owner": 1
                  }], done);
              });
          });
      });
  });
});
