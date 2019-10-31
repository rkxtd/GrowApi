const acl = require('./acl');

// ALLOW: Guest:Register:User
acl.grant('guest')
    .execute('register')
    .on('user');

module.exports = acl;
