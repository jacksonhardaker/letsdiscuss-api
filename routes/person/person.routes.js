module.exports = function(server, config) {
  /* Require services for querying, creating, and deleting entities */
  const Person = require('./person')(config);

  server.route({
    method: 'GET',
    path: '/person',
    options: {
      handler: (request, h) => {
        let params = request.query;

        return Person.get(params.token);
      }
    }
  });
};
