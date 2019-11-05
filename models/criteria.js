const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;
const {ObjectId} = Schema.Types;

const  CriteriaSchema = new Schema({
    id: Schema.Types.ObjectId,
    author: {type: ObjectId, ref: 'Users', required: true, update: true},
    name: { type: String, required: true  },
    desc: { type: String, default: '' },
    primary: { type: Boolean, default: false },
    resolved: { type: Boolean, default: false },
    targetDate: {type: Date},
    createdDate: {type: Date, default: Date.now()},
    resolvedDate: {type: Date},
    order: {type: Number, default: 0},
});
CriteriaSchema.plugin(mongoosePaginate);

module.exports =  mongoose.model('Criteria', CriteriaSchema, 'criterias');
