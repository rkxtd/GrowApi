const acl = require('./acl');

// ALLOW: Admin:CRUD:User
acl.grant('admin')
    .execute('read')
    .execute('create')
    .execute('update')
    .execute('delete')
    .execute('register')
    .execute('promote')
    .on('user');

// ALLOW: Admin:Read:Users
acl.grant('admin')
    .execute('read').on('users');

// ALLOW: Admin:CRUD:Goal
acl.grant('admin')
    .execute('read')
    .execute('create')
    .execute('update')
    .execute('delete')
    .on('goal');

acl.grant('admin')
    .execute('read')
    .on('goals');

module.exports = acl;
