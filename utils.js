const Slugify = require('slugify');

function slugify(text) {
  Slugify(text, {
    replacement: '-',
    remove: /[$*_+~.()'"!\-:@]/g,
    lower: true
  });
}

module.exports = {
  slugify
};
