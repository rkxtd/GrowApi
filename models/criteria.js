const mongoose = require('mongoose');

// Define schema
const Schema = mongoose.Schema;

const  CriteriaSchema = new Schema({
    id: Schema.Types.ObjectId,
    name: { type: String, required: true  },
    desc: { type: String, default: '' },
    primary: { type: Boolean, default: false },
    resolved: { type: Boolean, default: false },
    targetDate: {type: Date},
    createdDate: {type: Date, default: Date.now()},
    resolvedDate: {type: Date},
});

module.exports =  mongoose.model('Criteria', CriteriaSchema );
