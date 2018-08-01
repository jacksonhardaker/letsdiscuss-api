module.exports = function(config) {
  const Person = require('../person/person')(config);

  async function login(token, data) {
    return await Person.save(token, data);
  }

  return {
    login: login
  };
};
