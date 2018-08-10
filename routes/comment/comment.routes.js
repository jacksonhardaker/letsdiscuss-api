module.exports = function(server, config, Joi) {
  /* Require services for querying, creating, and deleting entities */
  const Comment = require('./comment')(config);

  server.route({
    method: ['GET'],
    path: '/comments/{articleId}',
    options: {
      description:
        'Get all the comments for a given Article',
      validate: {
        query: {
          token: Joi.string()
            .optional()
            .description('the current token for the Person')
        },
        params: {
          articleId: Joi.string()
            .required()
            .description('the article id'),
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        const article = request.params.articleId;
        let token = request.query.token || request.headers.authorization || '';

        return await Comment.getAll(article);
      }
    }
  });

  server.route({
    method: ['GET'],
    path: '/comment/{articleId}',
    options: {
      description:
        'Get all the top level (not reply) comments for a given Article',
      validate: {
        query: {
          token: Joi.string()
            .optional()
            .description('the current token for the Person')
        },
        params: {
          articleId: Joi.string()
            .required()
            .description('the article id'),
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        const article = request.params.articleId;
        let token = request.query.token || request.headers.authorization || '';

        return await Comment.getComments(article);
      }
    }
  });

  server.route({
    method: ['GET'],
    path: '/comment/reply{commentId}',
    options: {
      description:
        'Get all the top level (not reply) comments for a given Article',
      validate: {
        query: {
          token: Joi.string()
            .optional()
            .description('the current token for the Person')
        },
        params: {
          commentId: Joi.string()
            .required()
            .description('the comment id'),
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        const comment = request.params.commentId;
        let token = request.query.token || request.headers.authorization || '';

        return await Comment.getReplies(comment);
      }
    }
  });

  server.route({
    method: ['PUT'],
    path: '/comment/{articleId}',
    options: {
      description:
        'Generate an Alias for the logged in Person (if necessary) then leave a Comment on the given Article',
      validate: {
        query: {
          token: Joi.string()
            .optional()
            .description('the current token for the Person')
        },
        payload: {
          comment: Joi.string()
            .required()
            .description('the Comment')
        },
        params: {
          articleId: Joi.string()
            .required()
            .description('the article id'),
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        const article = request.params.articleId;
        let payload = request.payload;
        let token = request.query.token || request.headers.authorization || '';

        return await Comment.leaveComment(token.trim(), article, payload.comment.trim(), null);
      }
    }
  });

  server.route({
    method: ['PUT'],
    path: '/comment/{articleId}/reply/{replyingTo}',
    options: {
      description:
        'Generate an Alias for the logged in Person (if necessary) then leave a Comment on the given Article',
      validate: {
        query: {
          token: Joi.string()
            .optional()
            .description('the current token for the Person')
        },
        payload: {
          comment: Joi.string()
            .required()
            .description('the Comment')
        },
        params: {
          articleId: Joi.string()
            .required()
            .description('the article id'),
            replyingTo: Joi.string()
            .required()
            .description('the Comment to reply to')
        }
      },
      tags: ['api'],
      handler: async (request, h) => {
        const article = request.params.articleId;
        const replyingTo = request.params.replyingTo ? request.params.replyingTo : null;
        let params = request.query;
        let payload = request.payload;
        let token = params.token || request.headers.authorization || '';

        return await Comment.leaveComment(token.trim(), article, payload.comment.trim(), replyingTo);
      }
    }
  });
};
