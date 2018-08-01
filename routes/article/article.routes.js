module.exports = function(server, config) {
  /* Require services for querying, creating, and deleting entities */
  const article = require('./routes/article/article')(config);

  server.route({
    method: ['GET'],
    path: '/article',
    options: {
      handler: (request, h) => {
        let params = request.query;

        return new Promise((resolve, reject) => {
          article
            .createWithAlias(params.token, params.url)
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
