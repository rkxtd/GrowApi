const { Strategy } = require('passport-jwt');
const UserModel = require('../models/user');
const { jwtOptions } = require('../config');

module.exports = new Strategy(jwtOptions, async function({id, email, role}, next) {
    try {
        const user = await UserModel.findOne({_id: id, role, email});
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    } catch (err) {
        next(err, false);
    }

});
