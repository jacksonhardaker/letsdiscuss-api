module.exports = function(server, config, Joi) {
  /* Require services for querying, creating, and deleting entities */
  const Person = require('./person')(config);

  server.route({
    method: 'GET',
    path: '/person',
    options: {
      description: 'Get a Person using a token',
      validate: {
        query: {
          token: Joi.string()
            .optional()
            .description('the current token for the Person')
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        let params = request.query;

        let token = params.token || request.headers.authorization || '';

        let data = await Person.get(token.trim());

        return data ? data : h.response().code(404);
      }
    }
  });
};
