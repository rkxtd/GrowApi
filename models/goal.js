const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;
const GoalSchema = new Schema({
    id: ObjectId,
    archived: { type: Boolean, default: false },
    author: { type: ObjectId, ref: 'Users', required: true },
    parent: { type: ObjectId, ref: 'Goals', default: null },
    name: { type: String, required: true  },
    desc: { type: String, default: '' },
    resolved: { type: Boolean, default: false },
    targetDate: {type: Date},
    createdDate: {type: Date, default: Date.now()},
    resolvedDate: {type: Date},
    criteria: [ {type : mongoose.Schema.ObjectId, ref : 'Criteria'} ],
    tags: [ {type : mongoose.Schema.ObjectId, ref : 'Tags'} ],
});

module.exports =  mongoose.model('Goals', GoalSchema);
