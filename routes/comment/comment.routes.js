module.exports = function(server, config, Joi) {
  /* Require services for querying, creating, and deleting entities */
  const Comment = require('./comment')(config);

  server.route({
    method: ['PUT'],
    path: '/comment/{articleId}',
    options: {
      description:
        'Generate an Alias for the logged in Person (if necessary) then leave a Comment on the given Article',
      validate: {
        query: {
          token: Joi.string()
            .required()
            .description('the current token for the Person'),
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
        let params = request.query;

        return await Comment.leaveComment(params.token.trim(), article, params.comment.trim(), null);
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
            .required()
            .description('the current token for the Person'),
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

        return await Comment.leaveComment(params.token.trim(), article, params.comment.trim(), replyingTo);
      }
    }
  });
};
