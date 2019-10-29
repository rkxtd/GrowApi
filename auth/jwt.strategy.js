const { Strategy } = require('passport-jwt');
const UserModel = require('../models/user');
const { jwtOptions } = require('../config');

module.exports = new Strategy(jwtOptions, function(jwt_payload, next) {
    const user = UserModel.findOne({id: jwt_payload.id});
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});
