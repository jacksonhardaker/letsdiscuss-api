module.exports = function(config) {
  const Datastore = require('@google-cloud/datastore');
  const Storage = require('@google-cloud/storage');
  const SillyName = require('sillyname');
  const Moment = require('moment');
  const Person = require('../person/person')(config);

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  const storage = new Storage({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  const bucket = storage.bucket(`${config.bucketName}`);

  async function create(token, article, transaction, allocatedId) {
    // Get person from token
    let id = await Person.getId(token);

    let entity = {
      key: datastore.key([
        'Alias',
        allocatedId ? datastore.int(allocatedId) : null
      ]), // Init with allocated id
      data: {
        person: id,
        createdDate: Moment().format(),
        article: article,
        name: SillyName(),
        picture: await _getRandomAvatar()
      }
    };

    return transaction ? transaction.save(entity) : datastore.save(entity);
  }

  async function get(id) {
    let result = await _get(id);

    // Is an alias found?
    if (result.length === 0) {
      return null;
    }

    // Attempt to get URL for picture
    result[0].pictureUrl = _getPictureUrl(result);

    return result[0];
  }

  async function getByArticleAndToken(token, article) {
    let result = await _getByArticleAndToken(token, article);

    // Is an alias found?
    if (result.length === 0) {
      return null;
    }

    // Attempt to get URL for picture
    result[0].pictureUrl = await _getPictureUrl(result);

    return result[0];
  }

  async function getId(token, article) {
    let result = await _getByArticleAndToken(token, article);

    if (result.length === 0) {
      return null;
    }

    return result[0][datastore.KEY].id;
  }

  /**
   * PRIVATE FUNCTIONS
   */

  async function _getPictureUrl(res) {
    if (res && res[0].picture) {
      let file = bucket.file(res[0].picture);

      let pictureUrl = await file.getMetadata().then(data => {
        return data[1].mediaLink;
      });

      return pictureUrl;
    }
  }

  function _getRandomAvatar() {
    return new Promise((resolve, reject) => {
      bucket.getFiles({ directory: 'avatars' }, (err, files) => {
        const randomIndex = Math.floor(Math.random() * (files.length - 1)) + 1;

        resolve(files[randomIndex].name);
      });
    });
  }

  async function _getByArticleAndToken(token, article) {
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

  async function _get(id) {
    if (id) {
      // Create query
      let query = datastore
        .createQuery(['Alias'])
        .filter('__key__', '=', datastore.key(['Alias', datastore.int(id)]));

      let result = await datastore.runQuery(query);

      return result[0];
    }

    return null;
  }

  return {
    create,
    get,
    getByArticleAndToken,
    getId
  };
};
