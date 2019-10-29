const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const {jwtOptions} = require('../config');

router.post('/', async ({body: {login, passwd}}, res) => {
    const user = await UserModel.findOne({login});
    if (!user) return res.status(401).json({err: 'USER_NOT_FOUND', login});

    const validate = await user.validatePassword(passwd);
    if (!validate) return res.status(401).json({err: 'ACCESS_DENIED', login});

    const payload = {id: user._id, email: user.email};
    const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: jwtOptions.tokenTTL });
    return res.json({
        message: "ok",
        token: token,
        expiresAt: jwtOptions.tokenTTL,
        expiresOn: moment().add(jwtOptions.tokenTTL).valueOf(),
    });
});

module.exports = router;
