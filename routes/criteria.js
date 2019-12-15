const express = require('express');
const mongoose = require('mongoose');

const GoalModel = require('../models/goal');
const CriteriaModel = require('../models/criteria');

const acl = require('../acl');
const { defaultPutMethod, defaultDeleteMethod } = require('./helpers/update');

const router = express.Router();

router.get('/', async (req, res) => {
    const {query: {skip:offset = 0, limit = 10}, user} = req;
    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: user._id.toString() })
        .execute('read')
        .on('criteria');

    if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: { id: user._id }});

    try {
        const goals = await CriteriaModel.paginate({author: user._id}, {
            offset: parseInt(offset),
            limit: parseInt(limit),
            sort: { createdDate: 'desc' }});

        return res.status(200).json(goals);

    } catch (err) {
        return res.status(400).json({err: 'CRITERIA_FETCH_FAILED', msg: err});
    }
});

router.get('/:goalId', async (req, res) => {
    const { params: { goalId }, user } = req;
    if(!mongoose.Types.ObjectId.isValid(goalId)) {
        return res.status(400).json({message: 'GOAL_ID_INCORRECT', data: {id: goalId}});
    }

    const goal = await GoalModel.findOne({ _id: goalId });
    if (!goal) return res.status(404).json({message: 'GOAL_NOT_FOUND', data: {id: goalId}});

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: goal.author.toString() })
        .execute('read')
        .on('criteria');

    if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: { id: user._id}});

    try {
        const goals = await CriteriaModel.find({goal: goal._id}).sort({order: 'asc'});

        return res.status(200).json(goals);

    } catch (err) {
        return res.status(400).json({message: 'GOALS_FETCH_FAILED', data: {details: err}});
    }
});

router.post('/', async ({body, user}, res) => {

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: body.author })
        .execute('create')
        .on('criteria');

    if (!permission.granted)
        return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {id: user._id.toString()}});


    const criteria = new CriteriaModel({...body});
    try {
        await criteria.save();
        return res.status(201).json({message: 'CRITERIA_CREATED', data: {id: criteria._id}});
    } catch (err) {
        return res.status(400).json({message: 'CRITERIA_CREATE_FAILED', data: {details: err}});
    }
});

router.put('/:criteriaId', async (req, res) => {
    const { params: { criteriaId }, body, user } = req;
    return await defaultPutMethod(criteriaId, 'criteria', user, CriteriaModel, body, res);
});

router.delete('/:criteriaId', async ({params: { criteriaId }, body, user}, res) => {
    return await defaultDeleteMethod(criteriaId, CriteriaModel, 'criteria', user, res);
});

module.exports = router;
