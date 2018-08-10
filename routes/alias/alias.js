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

    return result[0] ? result[0] : null;
  }

  async function getByArticleAndToken(token, article) {
    let result = await _getByArticleAndToken(token, article);

    return result[0] ? result[0] : null;
  }

  async function getByArticle(article) {
    let result = await _getByArticle(article);

    return result;
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

  function _getRandomAvatar() {
    return new Promise((resolve, reject) => {
      bucket.getFiles({ directory: 'avatars' }, (err, files) => {
        const randomIndex = Math.floor(Math.random() * (files.length - 1)) + 1;

        resolve(files[randomIndex].name);
      });
    });
  }

  async function _getByArticle(article) {
    if (article) {
      let query = datastore
        .createQuery(['Alias'])
        .filter('article', '=', article);

      return await _runQuery(query);
    }

    return null;
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

      return await _runQuery(query);
    }

    return null;
  }

  async function _get(id) {
    if (id) {
      // Create query
      let query = datastore
        .createQuery(['Alias'])
        .filter('__key__', '=', datastore.key(['Alias', datastore.int(id)]));

      return await _runQuery(query);
    }

    return null;
  }

  async function _getPictureUrl(res) {
    if (res && res.picture) {
      let file = bucket.file(res.picture);

      let pictureUrl = await file.getMetadata().then(data => {
        return data[1].mediaLink;
      });

      return pictureUrl;
    }
  }

  async function _mapPictureUrls(aliases) {
    return new Promise(async (resolve, reject) => {
      const mappedWithPictureUrl = [];

      for (var i = 0; i < aliases.length; i++) {
        await mappedWithPictureUrl.push(Object.assign(aliases[i], { pictureUrl: await _getPictureUrl(aliases[i]) }));
      }

      resolve(mappedWithPictureUrl);
    });
  }

  async function _runQuery(query) {
    let result = await datastore.runQuery(query);

    if (result[0].length > 0) {
      // Map ids.
      const mappedWithId = result[0].map(alias => {
        return Object.assign(alias, { id: alias[datastore.KEY].id });
      });

      // Map picture urls
      const mappedWithPictureUrl = _mapPictureUrls(mappedWithId);

      return mappedWithPictureUrl;
    }

    return [];
  }

  return {
    create,
    get,
    getByArticleAndToken,
    getId,
    getByArticle
  };
};
