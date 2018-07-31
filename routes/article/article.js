module.exports = function(config) {
  const Datastore = require('@google-cloud/datastore');
  const urlMetadata = require('url-metadata');
  const person = require('../person/person')(config);

  const datastore = new Datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  async function save(token, url) {
    let metadata = await urlMetadata(url);

    // Get user from token
    let creator = await person.getId(token);

    var entity = {
      key: datastore.key('Article'),
      data: {
        createdBy: creator,
        createdDate: new Date(),
        url: url,
        title: metadata.title,
        image: metadata.image,
        author: metadata.author,
        description: metadata.description
      }
    };

    return entity;

    // datastore.save(entity, (err, apiResponse) => {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     resolve(apiResponse.mutationResults[0].key.path[0].id);
    //   }
    // });
  }

  return {
    save: save
  };
};
