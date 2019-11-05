const express = require('express');
const mongoose = require('mongoose');

const GoalModel = require('../models/goal');
const CriteriaModel = require('../models/criteria');

const acl = require('../acl');
const { updateModel } = require('./helpers/update');

const router = express.Router();

router.get('/', async (req, res) => {
    const {query: {skip:offset = 0, limit = 10}, user} = req;
    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: user._id.toString() })
        .execute('read')
        .on('criterias');

    if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: user._id});

    try {
        const goals = await CriteriaModel.paginate({author: user._id}, {
            offset: parseInt(offset),
            limit: parseInt(limit),
            sort: { createdDate: 'desc' }});

        return res.status(200).json(goals);

    } catch (err) {
        return res.status(400).json({err: 'CRITERIAS_FETCH_FAILED', msg: err});
    }
});

router.get('/:goalId', async (req, res) => {
    const { params: { goalId }, user } = req;
    if(!mongoose.Types.ObjectId.isValid(goalId)) {
        return res.status(400).json({err: 'GOAL_ID_INCORRECT', id: goalId});
    }

    const goal = await GoalModel.findOne({ _id: goalId });
    if (!goal) return res.status(404).json({err: 'GOAL_NOT_FOUND', id: goalId});

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: goal.author.toString() })
        .execute('read')
        .on('criterias');

    if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: user._id});

    try {
        const goals = await CriteriaModel.find({goal: goal._id}).sort({order: 'asc'});

        return res.status(200).json(goals);

    } catch (err) {
        return res.status(400).json({err: 'GOALS_FETCH_FAILED', msg: err});
    }
});

router.post('/', async ({body, user}, res) => {
    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: body.author })
        .execute('create')
        .on('criteria');

    if (!permission.granted)
        return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: user._id.toString()});


    const criteria = new CriteriaModel({...body});
    try {
        await criteria.save();
        return res.status(201).json({msg: 'CRITERIA_CREATED', id: criteria._id});
    } catch (err) {
        return res.status(400).json({err: 'CRITERIA_CREATE_FAILED', msg: err});
    }
});

module.exports = router;
