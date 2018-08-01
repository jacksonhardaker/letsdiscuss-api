module.exports = function(config) {
  const Slugify = require('slugify');

  function slugify(text) {
    Slugify(text, {
      replacement: '-',
      remove: /[$*_+~.()'"!\-:@]/g,
      lower: true
    });
  }

  return {
    slugify: slugify
  };
};
