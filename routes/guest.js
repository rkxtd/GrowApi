const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const UserModel = require('../models/user');
const {jwtOptions} = require('../config');

const router = express.Router();

router.post('/login', async ({body: {login, passwd}}, res) => {
    const user = await UserModel.findOne({login});
    if (!user) return res.status(401).json({message: 'USER_NOT_FOUND', data: {login}});

    const validate = await user.validatePassword(passwd);
    if (!validate) return res.status(401).json({message: 'ACCESS_DENIED', data: {login}});
    const {_id:id, email, role, firstName, lastName } = user;

    const payload = { id, email, role };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: jwtOptions.tokenTTL });

    return res.json({
        message: "ok",
        token: token,
        expiresAt: jwtOptions.tokenTTL,
        expiresOn: moment().add(jwtOptions.tokenTTL).valueOf(),
        userDetails: {
            firstName,
            lastName
        }
    });
});

router.post('/register', async ({body}, res) => {
    const newUser = new UserModel({role: 'user'});
    const registerFields = newUser.getRegisterFields();
    for(let field of registerFields) {
        newUser.set(field, body[field]);
    }
    try {
        await newUser.save();
        res.status(201).json({message: 'USER_REGISTERED', data: {id: newUser._id}})
    } catch (err) {
        return res.status(400).json({message: 'USER_REGISTER_FAILED', data: {details: err}});
    }
});

module.exports = router;
