const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;
const {ObjectId} = Schema.Types;
const GoalSchema = new Schema({
    id: ObjectId,
    archived: {type: Boolean, default: false, update: true},
    author: {type: ObjectId, ref: 'Users', required: true, update: true},
    parent: {type: ObjectId, ref: 'Goals', default: null, update: true},
    name: {type: String, required: true, update: true},
    desc: {type: String, default: null, update: true},
    resolved: {type: Boolean, default: false, update: true},
    targetDate: {type: Date, default: null, update: true},
    createdDate: {type: Date, default: Date.now()},
    resolvedDate: {type: Date, default: null, update: true},
    criteria: [{type: mongoose.Schema.ObjectId, ref: 'Criteria'}],
    tags: [{type: mongoose.Schema.ObjectId, ref: 'Tags'}],
});


GoalSchema.plugin(mongoosePaginate);
GoalSchema.methods.getUpdateFields = function() {
    const fields = [];
    for (let [field, { update }] of Object.entries(this.schema.obj)) {
        if (!update) continue;
        fields.push(field)
    }
    return fields;
};

module.exports = mongoose.model('Goals', GoalSchema);
