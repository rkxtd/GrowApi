const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const UserModel = require('../models/user');
const {jwtOptions} = require('../config');

const router = express.Router();

router.post('/login', async ({body: {login, passwd}}, res) => {
    const user = await UserModel.findOne({login});
    if (!user) return res.status(401).json({err: 'USER_NOT_FOUND', login});

    const validate = await user.validatePassword(passwd);
    if (!validate) return res.status(401).json({err: 'ACCESS_DENIED', login});
    const {_id:id, email, role} = user;

    const payload = { id, email, role };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: jwtOptions.tokenTTL });
    return res.json({
        message: "ok",
        token: token,
        expiresAt: jwtOptions.tokenTTL,
        expiresOn: moment().add(jwtOptions.tokenTTL).valueOf(),
    });
});

router.post('/register', async ({body}, res) => {
    // const acl = user.acl();
    // const permission = await acl
    //     .can(user.role)
    //     .execute('create')
    //     .on('user');
    //
    // if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: user._id.toString()});
    // let role = 'user';
    // if (permission.attributes === '*' || permission.attributes.includes('role')) {
    //     role = body.role || role;
    // }
    // const newUser = new UserModel({...body, role});
    // newUser.save(err => {
    //     if (err) return res.status(400).json({err: 'USER_CREATE_FAILED', msg: err});
    //     res.status(201).json({msg: 'USER_CREATED', id: newUser._id})
    // });
});

module.exports = router;
