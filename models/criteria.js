const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;
const {ObjectId} = Schema.Types;

const  CriteriaSchema = new Schema({
    id: Schema.Types.ObjectId,
    author: { type: ObjectId, ref: 'Users', required: true, update: true },
    name: { type: String, required: true, update: true  },
    desc: { type: String, default: '', update: true },
    primary: { type: Boolean, default: false, update: true },
    resolved: { type: Boolean, default: false, update: true },
    targetDate: {type: Date, update: true},
    createdDate: {type: Date, default: Date.now()},
    resolvedDate: {type: Date, update: true},
    order: {type: Number, default: 0, update: true},
});
CriteriaSchema.plugin(mongoosePaginate);

CriteriaSchema.methods.getUpdateFields = function() {
    const fields = [];
    for (let [field, { update }] of Object.entries(this.schema.obj)) {
        if (!update) continue;
        fields.push(field)
    }
    return fields;
};

module.exports =  mongoose.model('Criteria', CriteriaSchema, 'criterias');
