module.exports = function(config) {
  const Datastore = require('@google-cloud/datastore');
  const SillyName = require('sillyname');
  const Moment = require('moment');
  const Person = require('../person/person')(config);

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  async function create(token, article, transaction, allocatedId) {
    // Get person from token
    let id = await Person.getId(token);

    let entity = {
      key: datastore.key(['Alias', allocatedId ? datastore.int(allocatedId) : null]), // Init with allocated id
      data: {
        person: id,
        createdDate: Moment().format(),
        article: article,
        name: SillyName(),
        picture: ''
      }
    };

    return transaction ? transaction.save(entity) : datastore.save(entity);
  }

  async function get(token, article) {
    let result = await _get(token, article);

    return result ? result[0] : result;
  }

  async function getId(token, article) {
    let result = await _get(token, article);

    return result ? result[0][datastore.KEY].id : result;
  }

  /**
   * PRIVATE FUNCTIONS
   */

  async function _get(token, article) {
    if (token && article) {
      // Get person from token
      let person = await Person.getId(token);

      // Create query
      let query = datastore
        .createQuery(['Alias'])
        .filter('article', '=', article)
        .filter('person', '=', person);

      let result = await datastore.runQuery(query);

      return result[0];
    }

    return null;
  }

  return {
    create,
    get,
    getId
  };
};
