module.exports = function(server, config) {
  /* Require services for querying, creating, and deleting entities */
  const Comment = require('./comment')(config);

  // server.route({
  //   method: 'GET',
  //   path: '/person',
  //   options: {
  //     handler: (request, h) => {
  //       let params = request.query;

  //       return person.get(params.token);
  //     }
  //   }
  // });
};
