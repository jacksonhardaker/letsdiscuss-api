module.exports = function(config) {
  const Datastore = require('@google-cloud/datastore');

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  async function get(token) {
    let result = await _get(token);

    return result[0];
  }

  async function getId(token) {
    let result = await _get(token);

    return result[0][datastore.KEY].id;
  }

  /**
   * PRIVATE FUNCTIONS
   */

  async function _get(token) {
    // Create query
    let query = datastore.createQuery(['Person']).filter('token', '=', token);

    let result = await datastore.runQuery(query);

    return result[0];
  }

  return {
    get: get,
    getId: getId
  };
};
