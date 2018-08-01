module.exports = function(config) {
  const Datastore = require('@google-cloud/datastore');

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  async function save(token, data) {
    // Updating existing user?
    let personId = await getId(token);
    let key = personId
      ? datastore.key(['Person', datastore.int(personId)])
      : datastore.key('Person');

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

    return await datastore.save(entity);
  }

  async function get(token) {
    let result = await _get(token);

    return result ? result[0] : result;
  }

  async function getId(token) {
    let result = await _get(token);

    return result ? result[0][datastore.KEY].id : result;
  }

  /**
   * PRIVATE FUNCTIONS
   */

  async function _get(token) {
    // Create query
    if (token) {
      let query = datastore.createQuery(['Person']).filter('token', '=', token);

      let result = await datastore.runQuery(query);

      return result[0];
    }

    return null;
  }

  return {
    get,
    getId,
    save
  };
};
