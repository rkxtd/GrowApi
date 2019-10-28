const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cryptoRandomString = require('crypto-random-string');
const jwt = require('jsonwebtoken');
const logger = require('morgan');
const db = require('./db');
const UserModel = require('./models/user');
const bodyParser = require("body-parser");
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const moment = require('moment');

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = cryptoRandomString({length: 24});

const JWT_TOKEN_TTL = '30m';

const strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  const user = UserModel.findOne({id: jwt_payload.id});
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

// parse application/json
app.use(bodyParser.json());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(passport.initialize());
passport.use('JWT', strategy);
passport.use('jwt', strategy);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/healthcheck', require('express-healthcheck')());

app.use('/', indexRouter);
app.post("/Grow/1.0.0/login", async ({body: {login, passwd}}, res) => {
  const user = await UserModel.findOne({login});
  if (!user) return res.status(401).json({err: 'USER_NOT_FOUND', login});

  const validate = await user.validatePassword(passwd);
  if (!validate) return res.status(401).json({err: 'ACCESS_DENIED', login});

  const payload = {id: user._id, email: user.email};
  console.log('Signed: ', payload);
  const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: JWT_TOKEN_TTL });
  res.json({
    message: "ok",
    token: token,
    expiresAt: JWT_TOKEN_TTL,
    expiresOn: moment().add(JWT_TOKEN_TTL).valueOf(),
  });
});
app.use('/Grow/1.0.0/users', passport.authenticate(
    'jwt',
    { session: false }), usersRouter);

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
