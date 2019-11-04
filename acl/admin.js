const acl = require('./acl');

// ALLOW: Admin:CRUD:User
acl.grant('admin')
    .execute('read').on('user')
    .execute('create').on('user')
    .execute('update').on('user')
    .execute('delete').on('user')
    .execute('register').on('user')
    .execute('promote').on('user');

// ALLOW: Admin:Read:Users
acl.grant('admin')
    .execute('read').on('users');

// ALLOW: Admin:CRUD:Goal
acl.grant('admin')
    .execute('read').on('goal')
    .execute('create').on('goal')
    .execute('update').on('goal')
    .execute('delete').on('goal');

acl.grant('admin')
    .execute('read').on('goals');

module.exports = acl;
