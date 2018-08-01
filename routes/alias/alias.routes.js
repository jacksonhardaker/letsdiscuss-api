module.exports = function(server, config) {
  /* Require services for querying, creating, and deleting entities */
  const Alias = require('./alias')(config);

  server.route({
    method: 'GET',
    path: '/alias/{articleId}',
    options: {
      handler: (request, h) => {
        const article = request.params.articleId;
        let params = request.query;

        return Alias.get(params.token, article);
      }
    }
  });
};
