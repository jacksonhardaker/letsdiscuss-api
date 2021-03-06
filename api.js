'use strict';

/* Require shared configuration variables, eg. our Google Project ID */
const config = require('./config');

/* Require Hapi web framework */
const Bell = require('bell');
const Hapi = require('hapi');
const HapiSwagger = require('hapi-swagger');
const Inert = require('inert');
const Joi = require('joi');
const Pack = require('./package');
const Vision = require('vision');
const sessions = require('./sessions');

const internals = {};

internals.start = async function() {
  /* Configure Hapi server */
  const server = await new Hapi.server({
    host: 'localhost',
    port: '3000',
    routes: {
      cors: true
    }
  });

  const swaggerOptions = {
    info: {
      title: 'Test API Documentation',
      version: Pack.version
    }
  };

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ]);


  /** Configure AUTH routes */
  process.env.REDIRECT_URL = '"http://localhost:8080"';

  // Register bell with the server
  await server.register(Bell);

  // Register routes
  // server.realm.modifiers.route.prefix = '/v0';
  try {
    require('./routes/alias/alias.routes')(server, config, Joi);
    require('./routes/article/article.routes')(server, config, Joi);
    require('./routes/comment/comment.routes')(server, config, Joi);
    require('./routes/oauth/oauth.routes')(server, config, Joi, sessions);
    require('./routes/person/person.routes')(server, config, Joi);
    require('./routes/token/token.routes')(server, config, Joi, sessions);
  } catch (err) {
    console.log(err);
  }

  // Start the server
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

internals.start();
