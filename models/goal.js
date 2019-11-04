const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;
const {ObjectId} = Schema.Types;
const GoalSchema = new Schema({
    id: ObjectId,
    archived: {type: Boolean, default: false},
    author: {type: ObjectId, ref: 'Users', required: true},
    parent: {type: ObjectId, ref: 'Goals', default: null},
    name: {type: String, required: true},
    desc: {type: String, default: null},
    resolved: {type: Boolean, default: false},
    targetDate: {type: Date, default: null},
    createdDate: {type: Date, default: Date.now()},
    resolvedDate: {type: Date, default: null},
    criteria: [{type: mongoose.Schema.ObjectId, ref: 'Criteria'}],
    tags: [{type: mongoose.Schema.ObjectId, ref: 'Tags'}],
});


GoalSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Goals', GoalSchema);
