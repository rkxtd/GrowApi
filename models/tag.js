const mongoose = require('mongoose');

// Define schema
const Schema = mongoose.Schema;

const  TagSchema = new Schema({
    id: String,
    name: String
});

// Compile model from schema
module.exports =  mongoose.model('TagModel', TagSchema );
