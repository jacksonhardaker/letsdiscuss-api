module.exports = function(config) {
  const { google } = require('googleapis');
  const Datastore = require('@google-cloud/datastore');

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  function saveUser(data, userId) {
    return new Promise((resolve, reject) => {
      var entity = {
        key: datastore.key('Person'),
        data: {
          googleId: data.profile.id,
          name: data.profile.displayName,
          email: data.profile.email,
          picture: data.profile.raw.picture,
          gender: data.profile.raw.gender,
          token: data.token
        }
      };

      // Updating existing user?
      if (userId) {
        entity.data.userId = userId;
      }

      datastore.save(entity, (err, apiResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve(apiResponse.mutationResults[0].key.path[0].id);
        }
      });
    });
  }

  return {
    saveUser: saveUser
  };
};
