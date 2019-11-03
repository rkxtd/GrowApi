const express = require('express');
const mongoose = require('mongoose');

const GoalModel = require('../models/goal');
const acl = require('../acl');

const router = express.Router();

router.get('/', async (req, res) => {
    const {query: {skip:offset = 0, limit = 10}, user} = req;
    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: user._id.toString() })
        .execute('read')
        .on('goals');

    if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: user._id});

    try {
        const goals = await GoalModel.paginate({author: user._id}, {offset: parseInt(offset), limit: parseInt(limit)});
        return res.status(200).json(goals);

    } catch (err) {
        return res.status(400).json({err: 'GOALS_FETCH_FAILED', msg: err});
    }
});

module.exports = router;
