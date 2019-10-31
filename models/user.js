const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate');
require('mongoose-type-email');

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

module.exports = mongoose.model('Users', UserSchema);
