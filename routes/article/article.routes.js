module.exports = function(server, config) {
  /* Require services for querying, creating, and deleting entities */
  const Article = require('./article')(config);

  server.route({
    method: ['PUT', 'POST'],
    path: '/article',
    options: {
      handler: (request, h) => {
        let params = request.query;

        return new Promise((resolve, reject) => {
          Article.createWithAlias(params.token, params.url)
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
