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

  async function getAll(article) {
    return await _get(article);
  }

  async function getComments(article) {
    return await _getComments(article);
  }

  async function getReplies(comment) {
    return await _getReplies(comment);
  }

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
        createdDate: Moment().toDate(),
        article: article,
        body: body,
        replyingTo: replyingTo
      }
    };

    return transaction ? transaction.save(entity) : datastore.save(entity);
  }

  /**
   * PRIVATE FUNCTIONS
   */

  async function _getComments(article) {
    if (article) {
      let query = datastore
        .createQuery(['Comment'])
        .filter('article', '=', article)
        .filter('replyingTo', '=', null);

      return await _runQuery(query);
    }

    return null;
  }

  async function _getReplies(comment) {
    if (comment) {
      let query = datastore
        .createQuery(['Comment'])
        .filter('replyingTo', '=', comment);

      return await _runQuery(query);
    }

    return null;
  }

  async function _runQuery(query) {
    let result = await datastore.runQuery(query);

    if (result[0].length > 0) {
      const article = result[0][0].article;

      // Map ids.
      const mappedWithId = result[0].map(comment => {
        return Object.assign(comment, { id: comment[datastore.KEY].id });
      });

      // Sort by date
      mappedWithId.sort(_compareByCreatedDate);

      // Get aliases which exist for this article.
      const aliases = await Alias.getByArticle(article);

      // Map alias to comment.
      const mappedWithAlias = mappedWithId.map(comment => {

        // Find alias which matches comment
        const alias = aliases.find(alias => {
          return comment.alias === alias.id;
        });

        // Assign alias object.
        return Object.assign(comment, { alias: alias });
      });

      return mappedWithAlias;
    }

    return [];
  }

  async function _get(article) {
    // Create query
    if (article) {
      let query = datastore
        .createQuery(['Comment'])
        .filter('article', '=', article);

      const mappedWithId = await _runQuery(query);

      // Get all comments that are replies
      const replies = mappedWithId.filter(comment => comment.replyingTo);

      // Get all comments that are not replies (though they may HAVE replies)
      const commentsWithoutReplies = mappedWithId.filter(
        comment => !comment.replyingTo
      );

      // Find any replies to the top level comment, and map to a 'replies' array
      const commentsWithReplies = commentsWithoutReplies.map(comment => {
        const commentReplies = replies.filter(
          reply => reply.replyingTo === comment.id
        );

        return Object.assign(comment, { replies: commentReplies });
      });

      return commentsWithReplies;
    }

    // No article, so null.
    return null;
  }

  function _compareByCreatedDate(a, b) {
    let aMoment = Moment(a.createdDate);
    let bMoment = Moment(b.createdDate);

    if (aMoment.isBefore(bMoment)) {
      //a is less than b by some ordering criterion
      return -1;
    } else if (aMoment.isAfter(bMoment)) {
      //a is greater than b by the ordering criterion
      return 1;
    }

    // a must be equal to b
    return 0;
  }

  return {
    leaveComment,
    getAll,
    getReplies,
    getComments
  };
};
