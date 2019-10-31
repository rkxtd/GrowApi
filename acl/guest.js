const acl = require('./base');

// ALLOW: Guest:Register:User
acl.grant('guest')
    .execute('register')
    .on('user');

module.exports = acl;
