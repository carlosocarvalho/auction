'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN:           'http://localhost:3000',
  SESSION_SECRET:   'qconnect-polis-secret',

  FACEBOOK_ID:      '669971793122435',
  FACEBOOK_SECRET:  'b5f924f5ae4a859115afc55686d68bfc',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
