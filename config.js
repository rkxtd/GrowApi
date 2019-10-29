const { ExtractJwt } = require('passport-jwt');
const cryptoRandomString = require('crypto-random-string');

module.exports = {
    jwtOptions: {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: cryptoRandomString({length: 24}),
        tokenTTL: '30m',
    }
};
