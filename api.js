'use strict';

/* Require shared configuration variables, eg. our Google Project ID */
const config = require('./config');

/* Require services for querying, creating, and deleting entities */
// var books = require('./books')(config); TODO: Replace

/* Require "auth" service for authenticating users and getting profile info */
const auth = require('./routes/auth')(config);

/* Require Hapi web framework */
const Hapi = require('hapi');

/* Configure Hapi web application */
const server = new Hapi.server();
server.connection({ port: 3000 });

server.start(err => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
