module.exports = function(config) {
  const Datastore = require('@google-cloud/datastore');
  const UrlMetadata = require('url-metadata');
  const Moment = require('moment');
  const Utils = require('../../utils');
  const SillyName = require('sillyname');
  const Person = require('../person/person')(config);
  const Alias = require('../alias/alias')(config);

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  async function createWithAlias(token, url) {
    const transaction = datastore.transaction();

    let allocated = await datastore.allocateIds(datastore.key(['Article']), 1);
    let allocatedId = allocated[0][0].id;

    return transaction
      .run()
      .then(() => {
        return save(token, url, transaction, allocatedId);
      })
      .then(() => {
        return Alias.create(token, allocatedId, transaction);
      })
      .then(results => {
        return transaction.commit();
      })
      .catch(() => transaction.rollback());
  }

  async function save(token, url, transaction, id) {
    let metadata = await UrlMetadata(url);

    // Get user from token
    let creator = await Person.getId(token);

    let moment = Moment();
    let slug = `${Utils.slugify(SillyName())}/${moment.format(
      'YYYY-MM-DD'
    )}/${Utils.slugify(metadata.title)}`;

    let entity = {
      key: datastore.key(['Article', id ? datastore.int(id) : null]), // Init with allocated id
      data: {
        createdBy: creator,
        createdDate: moment.format(),
        url: url,
        title: metadata.title,
        image: metadata.image,
        author: metadata.author,
        description: metadata.description,
        slug: slug
      }
    };

    return transaction.save(entity);
  }

  async function get(alias, date, slug) {
    let query = datastore.createQuery(['Article']).filter('slug', '=', `${alias}/${date}/${slug}`);

    return datastore.runQuery(query);
  }

  async function getById(id) {
    let query = datastore.createQuery(['Article']).filter('id', '=', id);

    return datastore.runQuery(query);
  }

  return {
    createWithAlias: createWithAlias,
    get: get,
    getById: getById
  };
};
