const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GoalSchema = new Schema({
    id: Schema.Types.ObjectId,
    archived: { type: Boolean, default: false },
    parent: { type: ObjectId, ref: 'Goals' },
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
