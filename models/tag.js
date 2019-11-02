const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const  TagSchema = new Schema({
    id: Schema.Types.ObjectId,
    name: { type: String, required: true  },
    desc: { type: String, default: '' }
});

module.exports =  mongoose.model('Tags', TagSchema );
