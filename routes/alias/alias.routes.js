module.exports = function(server, config, Joi) {
  /* Require services for querying, creating, and deleting entities */
  const Alias = require('./alias')(config);

  server.route({
    method: 'GET',
    path: '/alias/{articleId}',
    options: {
      description: 'Get an Alias using a token and article',
      validate: {
        query: {
          token: Joi.string()
            .required()
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

        let data = await Alias.get(params.token.trim(), article);

        return data ? data : h.response().code(404);
       
      }
    }
  });
};
