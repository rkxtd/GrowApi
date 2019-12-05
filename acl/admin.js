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

// ALLOW: Admin:Read:Goals
acl.grant('admin')
    .execute('read').on('goals');

// ALLOW: Admin:CRUD:Criteria
acl.grant('admin')
    .execute('read').on('criteria')
    .execute('create').on('criteria')
    .execute('update').on('criteria')
    .execute('delete').on('criteria');

// ALLOW: Admin:Read:Criteria
acl.grant('admin')
    .execute('read').on('criteria');

module.exports = acl;
