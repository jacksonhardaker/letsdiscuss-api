module.exports = function(config) {
  const Datastore = require('@google-cloud/datastore');

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  async function save(token, data) {
    // Updating existing user? TODO: Clean up
    let idFromToken = await getId(token);
    let idFromEmail = await getIdByEmail(data.email);

    let personId = idFromToken || idFromEmail;

    let key = personId
      ? datastore.key(['Person', datastore.int(personId)])
      : datastore.key('Person');

    let entity = {
      key: key,
      data: data
    };

    return await datastore.save(entity);
  }

  async function logout(token) {
    let person = await get(token);

    return await datastore.update({
      key: datastore.key(['Person', datastore.int(person.id)]),
      data: Object.assign(person, { token: null, tokenExpires: null })
    });
  }

  async function get(token) {
    let result = await _get(token);

    return result[0];
  }

  async function getId(token) {
    try {
      let result = await _get(token);
      return result[0].id;

    } catch (err) {
      return null;
    }
  }

  async function getIdByEmail(email) {
    try {
      let result = await _getByEmail(email);
      return result[0].id;
    } catch (err) {
      return null;
    }
  }

  /**
   * PRIVATE FUNCTIONS
   */

  async function _getByEmail(email) {
    // Create query
    if (email) {
      let query = datastore.createQuery(['Person']).filter('email', '=', email);

      return await _runQuery(query);
    }

    return null;
  }

  async function _get(token) {
    // Create query
    if (token) {
      let query = datastore.createQuery(['Person']).filter('token', '=', token);

      return await _runQuery(query);
    }

    return null;
  }

  async function _runQuery(query) {
    let result = await datastore.runQuery(query);

    if (result[0].length > 0) {
      // Map ids.
      const mappedWithId = result[0].map(alias => {
        return Object.assign(alias, { id: alias[datastore.KEY].id });
      });

      return mappedWithId;
    }

    return null;
  }

  return {
    get,
    getId,
    save,
    logout
  };
};
