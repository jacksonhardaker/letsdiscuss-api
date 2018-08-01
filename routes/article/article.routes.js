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
            .required()
            .description('the current token for the Person'),
          url: Joi.string()
            .required()
            .description('the url of the Article to share')
        }
      },
      tags: ['api'],
      handler: (request, h) => {
        let params = request.query;

        return new Promise((resolve, reject) => {
          Article.createWithAlias(params.token.trim(), params.url.trim())
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        });
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
      handler: (request, h) => {
        const alias = request.params.alias;
        const date = request.params.date;
        const slug = request.params.slug;

        return new Promise((resolve, reject) => {
          Article.get(alias, date, slug)
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        });
      }
    }
  });
};
