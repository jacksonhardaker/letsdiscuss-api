module.exports = function(config) {
  const Person = require('../person/person')(config);

  async function logout(token) {
    return await Person.logout(token);
  }

  return {
    logout
  };
};
