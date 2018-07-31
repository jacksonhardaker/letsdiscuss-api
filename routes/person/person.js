module.exports = function(config) {
    const Datastore = require('@google-cloud/datastore');
  
    const datastore = new Datastore({
      projectId: config.projectId,
      keyFilename: config.keyFilename
    });
  
    function get(token) {
      return new Promise((resolve, reject) => {
          let query = datastore.createQuery(['Person']).filter('token', '=', token);
          datastore.runQuery(query, (err, person) => {
              if (err) {
                  reject(err);
              }
              
              resolve(person[0]);
          })
      });
    }

    function getId(token) {
        return new Promise(resolve => {
            get(token).then((person) => {
                resolve(person[datastore.KEY].id);
            })
        });
        
    }
  
    return {
      get: get,
      getId: getId
    };
  };
  