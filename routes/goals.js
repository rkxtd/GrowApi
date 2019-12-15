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
        .on('goals');

    if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {id: user._id}});

    try {
        const goals = await GoalModel.paginate({author: user._id}, {
            offset: parseInt(offset),
            limit: parseInt(limit),
            sort: { order: 'asc' }});

        return res.status(200).json(goals);

    } catch (err) {
        return res.status(400).json({message: 'GOALS_FETCH_FAILED', data: {details: err}});
    }
});

router.get('/:goalId', async (req, res) => {
    const { params: { goalId }, user } = req;

    if(!mongoose.Types.ObjectId.isValid(goalId)) {
        return res.status(400).json({message: 'GOAL_ID_INCORRECT', data: {id: goalId}});
    }

    const goal = await GoalModel.findById(goalId);

    if (!goal) return res.status(404).json({message: 'GOAL_NOT_FOUND', data: {id: goalId}});

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: goal.author.toString() })
        .execute('read')
        .on('goal');

    if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {id: user._id}});
    await goal
        .populate('criteria')
        .populate('goals')
        .execPopulate();
    return res.status(200).json(goal);
});

router.post('/', async ({body, user}, res) => {
    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: body.author })
        .execute('create')
        .on('goal');

    if (!permission.granted)
        return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {id: user._id.toString()}});


    const goal = new GoalModel({...body});
    goal.save(err => {
        if (err) return res.status(400).json({message: 'GOAL_CREATE_FAILED', data: {details: err}});
        res.status(201).json({message: 'GOAL_CREATED', data: {id: goal._id}})
    });
});

router.put('/:goalId', async (req, res) => {
    const { params: { goalId }, body, user } = req;
    return await defaultPutMethod(goalId, 'goal', user, GoalModel, body, res);
});

router.put('/addCriteria/:goalId/:criteriaId', async (req, res) => {
    const { params: { goalId, criteriaId }, user } = req;
    if(!mongoose.Types.ObjectId.isValid(goalId))  return res.status(400).json({message: 'GOAL_ID_INCORRECT', data: {id: goalId}});
    if(!mongoose.Types.ObjectId.isValid(criteriaId))  return res.status(400).json({message: 'CRITERIA_ID_INCORRECT', data: {id: criteriaId}});
    const goal = await GoalModel.findById(goalId);
    const criteria = await CriteriaModel.findById(criteriaId);
    if (!goal) return res.status(404).json({message: 'GOAL_NOT_FOUND', data: {id: goalId}});
    if (!criteria) return res.status(404).json({message: 'CRITERIA_NOT_FOUND', data: {id: criteriaId}});

    const goalPermission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: goal.author.toString() })
        .execute('update')
        .on('goal');

    if (!goalPermission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {userId: user._id, goalId, criteriaId}});

    const criteriaPermission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: criteria.author.toString() })
        .execute('update')
        .on('criteria');

    if (!criteriaPermission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {userId: user._id, goalId, criteriaId}});

    if (goal.get('criteria').find(record => record._id.toString() === criteria._id.toString())) return res.status(409).json({message: 'CRITERIA_ALREADY_ASSIGNED_TO_GOAL', data: { goalId, criteriaId }});
    goal.criteria.push(criteria);

    try {
        await goal.save();
        return res.status(201).json({ message: 'CRITERIA_ASSIGNED_TO_GOAL', data: {goalId, criteriaId }})
    } catch (err) {
        return res.status(400).json({ message: 'CRITERIA_ASSIGN_TO_GOAL_FAILED', data: {goalId, criteriaId }});
    }
});

router.put('/removeCriteria/:goalId/:criteriaId', async (req, res) => {
    const { params: { goalId, criteriaId }, user } = req;
    if(!mongoose.Types.ObjectId.isValid(goalId))  return res.status(400).json({message: 'GOAL_ID_INCORRECT', data: {id: goalId}});
    if(!mongoose.Types.ObjectId.isValid(criteriaId))  return res.status(400).json({message: 'CRITERIA_ID_INCORRECT', data: {id: criteriaId}});
    const goal = await GoalModel.findById(goalId);
    const criteria = await CriteriaModel.findById(criteriaId);
    if (!goal) return res.status(404).json({message: 'GOAL_NOT_FOUND', data: {id: goalId}});
    if (!criteria) return res.status(404).json({message: 'CRITERIA_NOT_FOUND', data: {id: criteriaId}});

    const goalPermission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: goal.author.toString() })
        .execute('update')
        .on('goal');

    if (!goalPermission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {userId: user._id, goalId, criteriaId}});

    const criteriaPermission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: criteria.author.toString() })
        .execute('update')
        .on('criteria');

    if (!criteriaPermission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {userId: user._id, goalId, criteriaId}});

    if (!goal.get('criteria').find(record => record._id.toString() === criteria._id.toString())) return res.status(404).json({message: 'CRITERIA_NOT_ASSIGNED_TO_GOAL', data: {goalId, criteriaId }});

    goal.criteria = goal.criteria.filter(record => record._id.toString() !== criteria._id.toString());

    try {
        await goal.save();
        return res.status(201).json({ message: 'CRITERIA_REMOVED_FROM_GOAL', data: {goalId, criteriaId }})
    } catch (err) {
        return res.status(400).json({message: 'CRITERIA_REMOVE_FROM_GOAL_FAILED', data: {goalId, criteriaId }});
    }
});

router.delete('/:goalId', async ({params: { goalId }, body, user}, res) => {
    return await defaultDeleteMethod(goalId, GoalModel, 'goal', user, res);
});

module.exports = router;
