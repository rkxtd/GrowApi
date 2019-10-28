const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('mongoose-type-email');

const SALT_WORK_FACTOR = 10;
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    id: Schema.Types.ObjectId,
    login: {type: String, required: true, createIndexes: { unique: true }},
    salt: {type: String},
    passwd: {type: String, required: true},
    email: {type: mongoose.SchemaTypes.Email, required: true, createIndexes: { unique: true }},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    createdDate: {type: Date, default: Date.now()},
    profilePicture: String,
});

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
