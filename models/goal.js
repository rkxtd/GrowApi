const mongoose = require('mongoose');

// Define schema
const Schema = mongoose.Schema;

const  CriteriaSchema = new Schema({});

// Compile model from schema
module.exports =  mongoose.model('CriteriaModel', CriteriaSchema );
