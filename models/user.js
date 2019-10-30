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
    passwd: {type: String, required: true, update: true},
    email: {type: mongoose.SchemaTypes.Email, required: true, createIndexes: { unique: true }, update: true},
    firstName: {type: String, required: true, update: true},
    lastName: {type: String, required: true, update: true},
    createdDate: {type: Date, default: Date.now()},
    profilePicture: {type: String, update: true},
});
debugger;
UserSchema.plugin(mongoosePaginate);

// ALLOW: Anonymous:Create:User
ac.grant('anonymous')
    .execute('create')
    .on('user');

// ALLOW: User:Read:User
ac.grant('user')
    .execute('read')
    .on('user');

// ALLOW: User:Edit:User(Cond: Equals(Requester, Owner))
ac.grant('user')
    .condition({
        Fn: 'EQUALS',
        args: {'requester': '$.owner'}})
    .execute('update')
    .on('user', ['passwd', 'email', 'firstName']);


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


module.exports = mongoose.model('UserModel', UserSchema);
