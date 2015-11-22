# SupTrackedAPI ![](https://travis-ci.org/jkingsman/SupTrackedAPI.svg?branch=master)

Main SupTracked engine. Please refer to `/doc/index.html` for documentation and usage.

Please test with `npm test` and lint with `npm run lint` before PRing.

Point twilio at `http://username:password@host.com/twilio` with `GET` requests and the appropriate username and password set up in `data\config.js`.

Set configuration in `data\config.js`; you'll need to rename the example file.

Fill your SSL certs as outlined in `bin/www` in the `data/ssl` folder.

Note that the timezone must be correct on the system.
