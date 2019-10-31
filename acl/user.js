const acl = require('./base');

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

module.exports = acl;
