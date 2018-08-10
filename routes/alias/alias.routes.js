module.exports = function(server, config, Joi) {
  /* Require services for querying, creating, and deleting entities */
  const Alias = require('./alias')(config);

  server.route({
    method: 'GET',
    path: '/alias/current/{articleId}',
    options: {
      description: 'Get an Alias using a token and article',
      validate: {
        query: {
          token: Joi.string()
            .optional()
            .description('the current token for the Person')
        },
        params: {
          articleId: Joi.string()
            .required()
            .description('the article id')
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        const article = request.params.articleId;
        let params = request.query;
        let token = params.token || request.headers.authorization || '';

        let data = await Alias.getByArticleAndToken(token.trim(), article);

        return data;
       
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/alias/{id}',
    options: {
      description: 'Get an Alias using an id',
      validate: {
        params: {
          id: Joi.string()
            .required()
            .description('the alias id')
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        let data = await Alias.get(request.params.id);

        return data ? data : h.response().code(404);
       
      }
    }
  });
};
