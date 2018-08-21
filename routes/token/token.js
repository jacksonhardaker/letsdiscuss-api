module.exports = function(config) {
  const Person = require('../person/person')(config);
  
  async function validate(token) {
    const person = await Person.get(token);

    return person ? true : false;
  }

  return {
    validate
  };
};
