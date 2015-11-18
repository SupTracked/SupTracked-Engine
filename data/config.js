var config = {};

config.general = {};
config.general.port = 3000;

config.db = {};
config.db.location = 'data/db/suptracked.db';
config.db.test_location = ":memory:";

config.media = {};
config.media.location = 'data/media/'; // must have trailing slash
config.media.test_location = 'data/media_test/'; // this location will be created if it doesn't exist and deleted after testing

config.twilio = {};
config.twilio.sid = 'mySID';
config.twilio.auth_token = 'myAuthToken';
config.twilio.number = '+1415555123456';
config.twilio.username = 'twilioUser';
config.twilio.password = 'twilioPassword';

module.exports = config;
