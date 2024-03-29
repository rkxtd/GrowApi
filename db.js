//Import the mongoose module
const  mongoose = require('mongoose');

//Set up default mongoose connection
const  mongoDB = process.env.DB_CONNECTION || 'mongodb://127.0.0.1/goals_db_local';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//Get the default connection
const  db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;
