module.exports = function(config) {
  // const { google } = require('googleapis');
  const Datastore = require('@google-cloud/datastore');
  const person = require('../person/person')(config);

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  async function login(data, token) {
    // Updating existing user?
    let key = datastore.key('Person');

    if (token) {
      let personId = await person.getId(token);
      key = datastore.key(['Person', datastore.int(personId)]);
    }

    let entity = {
      key: key,
      data: {
        googleId: data.profile.id,
        name: data.profile.displayName,
        email: data.profile.email,
        picture: data.profile.raw.picture,
        gender: data.profile.raw.gender,
        token: data.token
      }
    };

    return datastore.save(entity, (err, apiResponse) => {
      if (err) {
        return err;
      } 

      return apiResponse;
    });
  }

  return {
    login: login
  };
};
