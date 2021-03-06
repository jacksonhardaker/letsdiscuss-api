module.exports = function(config) {
  const Person = require('../person/person')(config);

  async function login(token, data) {
    return await Person.save(token, {
      googleId: data.profile.id,
      name: data.profile.displayName,
      email: data.profile.email,
      picture: data.profile.raw.picture,
      gender: data.profile.raw.gender,
      token: data.token,
      tokenExpires: data.expiresIn
    });
  }

  return {
    login: login
  };
};
