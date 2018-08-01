'use strict';

/* Require shared configuration variables, eg. our Google Project ID */
const config = require('./config');

/* Require Hapi web framework */
const Hapi = require('hapi');
const Bell = require('bell');

const internals = {};

internals.start = async function() {
  /* Configure Hapi server */
  const server = new Hapi.server({
    host: 'localhost',
    port: '3000'
  });

  // Set cookie definition
  server.state('session', {
    ttl: 24 * 60 * 60 * 1000, // One day
    isSameSite: 'Lax',
    encoding: 'base64json'
  });

  /** Configure AUTH routes */
  process.env.REDIRECT_URL = 'http://localhost:3000';

  // Register bell with the server
  await server.register(Bell);

  server.auth.strategy('google', 'bell', {
    provider: 'google',
    password: 'cookie_encryption_password_secure',
    isSecure: false,
    clientId: config.oauth2.clientId,
    clientSecret: config.oauth2.clientSecret,
    location: server.info.uri
  });

  // Register routes
  require('./routes/alias/alias.routes')(server, config);
  require('./routes/article/article.routes')(server, config);
  require('./routes/comment/comment.routes')(server, config);
  require('./routes/oauth/oauth.routes')(server, config);
  require('./routes/person/person.routes')(server, config);

  // Start the server
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

internals.start();
