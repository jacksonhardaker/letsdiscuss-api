var alias = require('./alias/alias.routes');
var article = require('./article/article.routes');
var person = require('./article/person.routes');
var oauth = require('./article/oauth.routes');
var comment = require('./article/comment.routes');

module.exports = [...alias, ...article, ...person, ...oauth, ...comment];