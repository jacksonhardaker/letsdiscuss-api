module.exports = function(server, config, Joi) {
  /* Require services for querying, creating, and deleting entities */
  const GoogleAuth = require('./google')(config);
  const FacebookAuth = require('./facebook')(config);

  server.auth.strategy('google', 'bell', {
    provider: 'google',
    password: 'cookie_encryption_password_secure',
    isSecure: false,
    clientId: config.oauth2.google.clientId,
    clientSecret: config.oauth2.google.clientSecret,
    location: server.info.uri
  });

  server.auth.strategy('facebook', 'bell', {
    provider: 'facebook',
    password: 'cookie_encryption_password_secure',
    isSecure: false,
    clientId: config.oauth2.facebook.clientId,
    clientSecret: config.oauth2.facebook.clientSecret,
    location: server.info.uri
  });

  server.route({
    method: '*',
    path: '/oauth/google',
    options: {
      auth: {
        strategy: 'google',
        mode: 'try'
      },
      description: 'Sign up / Log in via Google oAuth',
      //   validate: {
      //     query: {
      //       token: Joi.string()
      //         .optional()
      //         .description('the current token for the Person')
      //     }
      //   },
      tags: ['api'],
      handler: async function(request, h) {
        if (!request.auth.isAuthenticated) {
          return 'Authentication failed due to: ' + request.auth.error.message;
        }

        // Check for previous params
        let params = request.auth.credentials.query;

        return await GoogleAuth.login(
          params.token ? params.token.trim() : null, // Existing token included?
          request.auth.credentials
        );
      }
    }
  });

  server.route({
    method: '*',
    path: '/oauth/facebook',
    options: {
      auth: {
        strategy: 'facebook',
        mode: 'try'
      },
      description: 'Sign up / Log in via Facebook oAuth',
      //   validate: {
      //     query: {
      //       token: Joi.string()
      //         .optional()
      //         .description('the current token for the Person')
      //     }
      //   },
      tags: ['api'],
      handler: async function(request, h) {
        if (!request.auth.isAuthenticated) {
          return 'Authentication failed due to: ' + request.auth.error.message;
        }

        // Check for previous params
        let params = request.auth.credentials.query;

        return await FacebookAuth.login(
          params.token ? params.token.trim() : null, // Existing token included?
          request.auth.credentials
        );
      }
    }
  });
};
