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
      .catch(err => {
        console.log(err);
        transaction.rollback();
      });
  }

  async function save(token, url, transaction, id) {
    let metadata = await UrlMetadata(url);

    // Get user from token
    let creator = await Person.getId(token);

    let slug = `${Utils.slugify(SillyName())}/${Moment().format(
      'YYYY-MM-DD'
    )}/${Utils.slugify(metadata.title)}`;

    let entity = {
      key: datastore.key(['Article', id ? datastore.int(id) : null]), // Init with allocated id
      data: {
        createdBy: creator,
        createdDate: Moment().toDate(),
        expires: Moment()
          .add(24, 'hours')
          .toDate(),
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
    let result = await _get(alias, date, slug);

    // Append id.
    if (result) {
      result[0].id = result[0][datastore.KEY].id;
    }

    return result ? result[0] : result;
  }

  async function getById(id) {
    let result = await _getById(id);

    return result ? result[0] : result;
  }

  async function getId(alias, date, slug) {
    let result = await _get(alias, date, slug);

    return result ? result[0][datastore.KEY].id : result;
  }

  /**
   * PRIVATE FUNCTIONS
   */

  async function _get(alias, date, slug) {
    // Create query
    if ((alias, date, slug)) {
      let query = datastore
        .createQuery(['Article'])
        .filter('slug', '=', `${alias}/${date}/${slug}`);

      let result = await datastore.runQuery(query);

      return result[0];
    }

    return null;
  }

  async function _getById(id) {
    // Create query
    if (id) {
      let query = datastore
        .createQuery(['Article'])
        .filter('__key__', '=', datastore.key(['Article', datastore.int(id)]));

      let result = await datastore.runQuery(query);

      return result[0];
    }

    return null;
  }

  return {
    createWithAlias,
    get,
    getById,
    getId
  };
};
