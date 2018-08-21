module.exports = function(server, config, Joi) {
  /* Require services for querying, creating, and deleting entities */
  const Article = require('./article')(config);

  server.route({
    method: ['PUT'],
    path: '/article',
    options: {
      description:
        'Set an Article and generate an Alias for the logged in Person',
      validate: {
        query: {
          token: Joi.string()
            .optional()
            .description('the current token for the Person')
        },
        payload: {
          url: Joi.string()
            .required()
            .description('the url of the Article to share')
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        let payload = request.payload;
        let token = request.query.token || request.headers.authorization || '';

        return await Article.createWithAlias(
          token.trim(),
          payload.url.trim()
        );
      }
    }
  });

  server.route({
    method: ['GET'],
    path: '/article/{alias}/{date}/{slug}',
    options: {
      description: 'Get an Article using the Article slug',
      validate: {
        params: {
          alias: Joi.string()
            .required()
            .description('the Alias created for the slug of this Article'),
          date: Joi.string()
            .required()
            .description('the date the Article was shared'),
          slug: Joi.string()
            .required()
            .description('the slug generated from the Article title')
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        const alias = request.params.alias;
        const date = request.params.date;
        const slug = request.params.slug;

        let data = await Article.get(alias, date, slug);

        return data ? data : h.response().code(404);
      }
    }
  });

  server.route({
    method: ['GET'],
    path: '/article/{articleId}',
    options: {
      description: 'Get an Article using the Article slug',
      validate: {
        params: {
          articleId: Joi.string()
            .required()
            .description('the id for the Article')
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        const article = request.params.articleId;

        let data = await Article.getById(article);

        return data ? data : h.response().code(404);
      }
    }
  });
};
