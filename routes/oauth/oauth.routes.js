module.exports = function(server, config) {
  /* Require services for querying, creating, and deleting entities */
  const GoogleAuth = require('./google')(config);

  server.route({
    method: '*',
    path: '/oauth/google',
    options: {
      auth: {
        strategy: 'google',
        mode: 'try'
      },
      handler: function(request, h) {
        if (!request.auth.isAuthenticated) {
          return 'Authentication failed due to: ' + request.auth.error.message;
        }

        // Check for previous params
        let params = request.auth.credentials.query;

        return new Promise((resolve, reject) => {
          GoogleAuth.login(
            request.auth.credentials,
            params.token ? params.token : null // Existing token included?
          ).then(personId => {
            resolve({
              token: request.auth.credentials.token
            });
          });
        });
      }
    }
  });
};
