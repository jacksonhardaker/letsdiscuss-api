module.exports = function(server, config, Joi, sessions) {
  /* Require services for querying, creating, and deleting entities */
  const Token = require('./token')(config);

  server.route({
    method: 'GET',
    path: '/token/isvalid/{token}',
    options: {
      description: 'Is the given token valid',
      validate: {
        params: {
          token: Joi.string()
            .required()
            .description('the current token ')
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        const token = request.params.token;

        // return sessions.get(token).refreshToken();

        // return sessions.get(token);

        return Token.validate(token.trim());
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/token/sessions',
    options: {
      tags: ['api'],
      handler: async (request, h) => {
        return sessions.get();
      }
    }
  });
};
