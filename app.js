const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const db = require('./db');
const bodyParser = require("body-parser");
const passport = require('passport');
const cors = require('cors');
const jwtStrategy = require('./auth/jwt.strategy');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const guestRouter = require('./routes/guest');
const goalsRouter = require('./routes/goals');
const criteriaRouter = require('./routes/criteria');
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

if (process.env.ENV == 'dev') {
  console.info('CORS Enabled');
  app.use(cors())
}

app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/healthcheck', require('express-healthcheck')());
app.use('/', indexRouter);
app.use("/Grow/1.0.0/guest", guestRouter);
app.use('/Grow/1.0.0/users', passport.authenticate(
    'jwt',
    { session: false }), usersRouter);
app.use('/Grow/1.0.0/goals', passport.authenticate(
    'jwt',
    { session: false }), goalsRouter);
app.use('/Grow/1.0.0/criteria', passport.authenticate(
    'jwt',
    { session: false }), criteriaRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
