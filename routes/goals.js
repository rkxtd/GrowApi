const express = require('express');
const mongoose = require('mongoose');

const GoalModel = require('../models/goal');
const acl = require('../acl');
const { updateModel } = require('./helpers/update');

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

router.post('/', async ({body, user}, res) => {
    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: body.author })
        .execute('create')
        .on('goal');

    if (!permission.granted)
        return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: user._id.toString()});


    const goal = new GoalModel({...body});
    goal.save(err => {
        if (err) return res.status(400).json({err: 'GOAL_CREATE_FAILED', msg: err});
        res.status(201).json({msg: 'GOAL_CREATED', id: goal._id})
    });
});

router.put('/:goalId', async (req, res) => {
    const { params: { goalId }, body, user } = req;
    if(!mongoose.Types.ObjectId.isValid(goalId)) {
        return res.status(400).json({err: 'GOAL_ID_INCORRECT', id: goalId});
    }

    const goal = await GoalModel.findById(goalId);
    if (!goal) return res.status(404).json({err: 'GOAL_NOT_FOUND', id: goalId});

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: goal.author.toString() })
        .execute('update')
        .on('goal');

    if (!permission.granted) return res.status(403).json({err: 'GOAL_NOT_AUTHORIZED', id: goalId});

    return await updateModel(goal, permission, body, res, 'GOAL_SAVED', 'GOAL_UPDATE_FAILED');
});

router.delete('/:goalId', async ({params: { goalId }, body, user}, res) => {
    if(!mongoose.Types.ObjectId.isValid(goalId)) {
        return res.status(400).json({err: 'GOAL_ID_INCORRECT', id: goalId});
    }

    const goal = await GoalModel.findOne({ _id: goalId });
    if (!goal) return res.status(404).json({err: 'GOAL_NOT_FOUND', id: goalId});

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: goal.author.toString() })
        .execute('delete')
        .on('goal');
    if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: user._id});

    const { deletedCount: deletedGoalsCount } = await GoalModel.deleteOne({ _id: goalId });
    if (!deletedGoalsCount) return res.status(400).json({
        err: 'GOAL_DELETE_FAILED',
        msg: 'Mongo can\'t delete goal',
        id: goalId
    });

    res.status(202).json({ msg: 'GOAL_DELETED', id: goalId })
});

module.exports = router;
