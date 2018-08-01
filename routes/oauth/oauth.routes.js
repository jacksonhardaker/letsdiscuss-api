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
      description: 'Sign up / Log in via Google oAuth',
      tags: ['api'],
      handler: function(request, h) {
        if (!request.auth.isAuthenticated) {
          return 'Authentication failed due to: ' + request.auth.error.message;
        }

        // Check for previous params
        let params = request.auth.credentials.query;

        return new Promise((resolve, reject) => {
          GoogleAuth.login(
            params.token ? params.token.trim() : null, // Existing token included?
            request.auth.credentials
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
