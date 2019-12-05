const acl = require('./acl');

// ALLOW: User:Read:User
acl.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {
            'requester': '$.owner'
        }})
    .execute('read')
    .on('user', ['_id', 'passwd', 'email', 'firstName', 'lastName', 'profilePicture']);

// ALLOW: User:Read:Users
acl.grant('user')
    .execute('read')
    .on('users', ['_id', 'email', 'firstName', 'lastName', 'profilePicture']);

// ALLOW: User:Update:User(Cond: Equals(Requester, Owner))
acl.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {
            'requester': '$.owner'
        }})
    .execute('update')
    .on('user', ['passwd', 'email', 'firstName', 'lastName', 'profilePicture']);

// ALLOW: User:Delete:User(Cond: Equals(Requester, Owner))
acl.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {'requester': '$.owner'}})
    .execute('delete')
    .on('user');

// ALLOW: User:CRUD:Goal(Cond: Equals(Requester, Owner))
acl.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {
            'requester': '$.owner'
        }})
    .execute('create').on('goal')
    .execute('read').on('goal')
    .execute('update').on('goal', ['archived', 'goals', 'criteria', 'tags', 'name', 'desc', 'resolved', 'targetDate', 'resolvedDate', 'order'])
    .execute('delete').on('goal');

// ALLOW: User:Read:Goals(Cond: Equals(Requester, Owner))
acl.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {
            'requester': '$.owner'
        }})
    .execute('read')
    .on('goals');

// ALLOW: User:CRUD:Criteria(Cond: Equals(Requester, Owner))
acl.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {
            'requester': '$.owner'
        }})
    .execute('create').on('criteria')
    .execute('read').on('criteria')
    .execute('update').on('criteria', ['name', 'desc', 'primary', 'resolved', 'targetDate', 'resolvedDate', 'order'])
    .execute('delete').on('criteria');

// ALLOW: User:Read:Criteria(Cond: Equals(Requester, Owner))
acl.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {
            'requester': '$.owner'
        }})
    .execute('read')
    .on('criteria');

module.exports = acl;
