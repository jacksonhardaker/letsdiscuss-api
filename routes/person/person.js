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

  async function get(token) {
    let result = await _get(token);

    return result ? result[0] : result;
  }

  async function getId(token) {
    let result = await _get(token);

    return result ? result[0][datastore.KEY].id : result;
  }

  async function getIdByEmail(email) {
    try {
      let result = await _getByEmail(email);

      return result ? result[0][datastore.KEY].id : result;
    }
    catch(err) {
      console.log(err);
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

      let result = await datastore.runQuery(query);

      return result[0];
    }

    return null;
  }

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
