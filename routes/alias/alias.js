module.exports = function(config) {
  const Datastore = require('@google-cloud/datastore');
  const SillyName = require('sillyname');
  const Person = require('../person/person')(config);

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  async function create(token, article, transaction) {
    // Get person from token
    let id = await Person.getId(token);

    let entity = {
      key: datastore.key('Alias'),
      data: {
        person: id,
        createdDate: new Date(),
        article: article,
        name: SillyName(),
        picture: ''
      }
    };

    if (transaction) {
      return transaction.save(entity);
    } else {
      return datastore.save(entity);
    }
  }

  async function get(token, article) {
    // Get person from token
    let person = await Person.getId(token);

    // Create query
    let query = datastore.createQuery(['Alias'])
    .filter('article', '=', article)
    .filter('person', '=', person);

    return datastore.runQuery(query);
  }

  return {
    create: create,
    get: get
  };
};
