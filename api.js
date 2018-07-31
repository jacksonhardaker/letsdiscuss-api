'use strict';

/* Require shared configuration variables, eg. our Google Project ID */
const config = require('./config');

/* Require services for querying, creating, and deleting entities */
// var books = require('./books')(config); TODO: Replace

/* Require "auth" service for authenticating users and getting profile info */
const googleAuth = require('./routes/google/oauth')(config);
const article = require('./routes/article/article')(config);
const person = require('./routes/person/person')(config);

/* Require Hapi web framework */
const Hapi = require('hapi');
const Bell = require('bell');

const internals = {};

internals.start = async function() {
  /* Configure Hapi server */
  const server = new Hapi.server({
    host: 'localhost',
    port: '3000'
  });

  // Set cookie definition
  server.state('session', {
    ttl: 24 * 60 * 60 * 1000, // One day
    isSameSite: 'Lax',
    encoding: 'base64json'
  });

  /** Configure AUTH routes */
  process.env.REDIRECT_URL = 'http://localhost:3000';

  // Register bell with the server
  await server.register(Bell);

  server.auth.strategy('google', 'bell', {
    provider: 'google',
    password: 'cookie_encryption_password_secure',
    isSecure: false,
    clientId: config.oauth2.clientId,
    clientSecret: config.oauth2.clientSecret,
    location: server.info.uri
  });

  server.route({
    method: '*',
    path: '/google/oauth',
    options: {
      auth: {
        strategy: 'google',
        mode: 'try'
      },
      handler: function(request, h) {
        if (!request.auth.isAuthenticated) {
          return 'Authentication failed due to: ' + request.auth.error.message;
        }

        return new Promise((resolve, reject) => {
          googleAuth
            .saveUser(
              request.auth.credentials,
              request.state.session ? request.state.session.id : null
            )
            .then(userId => {
              resolve({
                id: userId,
                token: request.auth.credentials.token
              });
            });
        });
      }
    }
  });

  server.route({
    method: ['GET'],
    path: '/article',
    options: {
      handler: (request, h) => {
        let params = request.query;

        return article.save(params.token, params.url);
        //return article.save('ya29.GlsJBp5P9JZDkxD1sLDn0mwntkvMN-FsVtJPTb57BTr9nuSHpK8sNAZ6_0acdHHx_nIimYdQAVaI_52UlaJCuzbX0h2fFQggKRLShOe9vdxbtk6hbYem9Q3fkKyt', 'https://medium.com/s/futurehuman/the-5-best-places-to-live-in-2100-e4c360ce3a27/');
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/person/{token}',
    options: {
      handler: (request, h) => {
        
        return person.getId(request.params.token);
      }
    }
  })

  // Start the server
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

// // Set cookie definition
// server.state('session', {
//   ttl: 24 * 60 * 60 * 1000, // One day
//   isSameSite: 'Lax',
//   encoding: 'base64json'
// });

// server.route({
//   method: 'GET',
//   path: '/',
//   handler: (req, h) => {
//     console.log(req.state);
//     if (req.state.session) {
//       console.log(req.state.session.user);
//       return `Hello ${req.state.session.user}`;
//     } else {
//       return 'Hello';
//     }
//   }
// });

// /* Redirect user to OAuth 2.0 login URL */
// server.route({
//   method: 'GET',
//   path: '/login',
//   handler: (req, h) => {
//     return h.redirect(auth.getAuthenticationUrl());
//   }
// });

// /* Use OAuth 2.0 authorization code to fetch user's profile */
// server.route({
//   method: 'GET',
//   path: '/oauth2callback',
//   handler: (req, h) => {
//     return new Promise((resolve, reject) => {
//       auth.getUser(req.query.code, (err, user) => {
//         if (err) {
//           reject(err);
//         }

//         let session = req.state.session ? req.state.session : {};
//         session.user = user;

//         resolve(
//           h
//             .response('Success')
//             .state('session', session)
//             .redirect('/')
//         );
//       });
//     });
//   }
// });

// server.route({
//   method: 'GET',
//   path: '/logout',
//   handler: (req, h) => {
//     req.session = null;
//     return h.redirect('/');
//   }
// // });

// process.on('unhandledRejection', err => {
//   console.log(err);
//   process.exit(1);
// });

internals.start();
