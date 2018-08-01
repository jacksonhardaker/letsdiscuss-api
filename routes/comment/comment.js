module.exports = function(config) {
  const Datastore = require('@google-cloud/datastore');
  const Moment = require('moment');
  const Utils = require('../../utils');
  const SillyName = require('sillyname');
  const Person = require('../person/person')(config);
  const Alias = require('../alias/alias')(config);

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  async function leaveComment(token, article, text, replyingTo) {
    const transaction = datastore.transaction();

    let alias = await Alias.getId(token, article);

    if (!alias) {
      // Assign a new alias.
      let allocated = await datastore.allocateIds(datastore.key(['Alias']), 1);
      alias = allocated[0][0].id;
    }

    return transaction
      .run()
      .then(() => {
        return Alias.create(token, article, transaction, alias);
      })
      .then(() => {
        return create(article, alias, text, replyingTo, transaction);
      })
      .then(() => {
        return transaction.commit();
      })
      .catch(err => {
        console.log(err);
        transaction.rollback();
      });
  }

  async function create(article, alias, body, replyingTo, transaction) {
    let entity = {
      key: datastore.key(['Comment']), // Init with allocated id
      data: {
        alias: alias,
        createdDate: Moment().format(),
        article: article,
        body: body,
        replyingTo: replyingTo
      }
    };

    return transaction ? transaction.save(entity) : datastore.save(entity);
  }

  return {
    leaveComment
  };
};
