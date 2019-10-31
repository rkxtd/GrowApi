const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate');
const AccessControl = require('role-acl');
require('mongoose-type-email');

const ac = new AccessControl();
const SALT_WORK_FACTOR = 10;
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    id: Schema.Types.ObjectId,
    login: {type: String, required: true, createIndexes: { unique: true }},
    salt: {type: String},
    role: {type: String, enum: ['user', 'admin']},
    passwd: {type: String, required: true, update: true},
    email: {type: mongoose.SchemaTypes.Email, required: true, createIndexes: { unique: true }, update: true},
    firstName: {type: String, required: true, update: true},
    lastName: {type: String, required: true, update: true},
    createdDate: {type: Date, default: Date.now()},
    profilePicture: {type: String, update: true},
});

UserSchema.plugin(mongoosePaginate);

// ALLOW: Anonymous:Register:User
ac.grant('anonymous')
    .execute('register')
    .on('user');

// ALLOW: User:Read:User
ac.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {
            'requester': '$.owner'
        }})
    .execute('read')
    .on('user', ['_id', 'passwd', 'email', 'firstName', 'lastName', 'profilePicture']);

// ALLOW: User:Read:Users
ac.grant('user')
    .execute('read')
    .on('users', ['_id', 'email', 'firstName', 'lastName', 'profilePicture']);

// ALLOW: User:Update:User(Cond: Equals(Requester, Owner))
ac.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {
            'requester': '$.owner'
        }})
    .execute('update')
    .on('user', ['passwd', 'email', 'firstName', 'lastName', 'profilePicture']);

// ALLOW: User:Delete:User(Cond: Equals(Requester, Owner))
ac.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {'requester': '$.owner'}})
    .execute('delete')
    .on('user');

// ALLOW: Admin:CRUD:User
ac.grant('admin')
    .execute('read').on('user')
    .execute('create').on('user')
    .execute('update').on('user')
    .execute('delete').on('user')
    .execute('register').on('user')
    .execute('promote').on('user');

// ALLOW: Admin:Read:Users
ac.grant('admin')
    .execute('read').on('users');

UserSchema.pre('save', async function(next) {
    if (!this.isModified('passwd')) return next();
    try {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        this.passwd = await bcrypt.hash(this.passwd, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

UserSchema.methods.validatePassword = async function(passwd) {
    return await bcrypt.compare(passwd, this.passwd);
};

UserSchema.methods.getUpdateFields = function() {
    const fields = [];
    for (let [field, { update }] of Object.entries(this.schema.obj)) {
        if (!update) continue;
        fields.push(field)
    }
    return fields;
};

UserSchema.methods.acl = function() {
    return ac;
};

module.exports = mongoose.model('Users', UserSchema);
