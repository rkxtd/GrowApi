const express = require('express');
const mongoose = require('mongoose');

const UserModel = require('../models/user');
const GoalModel = require('../models/goal');
const CriteriaModel = require('../models/criteria');

const { updateModel } = require('./helpers/update');
const acl = require('../acl');

const router = express.Router();

router.get('/', async (req, res) => {
  const {query: {skip:offset = 0, limit = 10}, user} = req;
  const permission = await acl
      .can(user.role)
      .execute('read')
      .on('users');
  if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {id: user._id}});

  try {
    const users = await UserModel.paginate({}, {offset: parseInt(offset), limit: parseInt(limit)});
    if (permission.attributes[0] === '*') {
      return res.status(200).json(users);
    } else {
      users.docs = users.docs.map(user => {
        const ret = {};
        for (attr of permission.attributes) {
          ret[attr] = user[attr];
        }
        return ret;
      });
      return res.status(200).json(users);
    }

  } catch (err) {
    return res.status(400).json({message: 'USER_FETCH_FAILED', data: {details: err}});
  }
});

router.post('/', async ({body, user}, res) => {
  const permission = await acl
      .can(user.role)
      .execute('create')
      .on('user');

  if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {id: user._id.toString()}});
  let role = 'user';
  if (permission.attributes === '*' || permission.attributes.includes('role')) {
    role = body.role || role;
  }
  const newUser = new UserModel({...body, role});
  newUser.save(err => {
    if (err) return res.status(400).json({message: 'USER_CREATE_FAILED', data: {details: err}});
    res.status(201).json({message: 'USER_CREATED', data: {id: newUser._id}})
  });
});

router.delete('/:userId', async ({params: { userId }, body, user: requester}, res) => {
  if(!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({message: 'USER_ID_INCORRECT', data: {id: userId}});
  }

  const user = await UserModel.findOne({ _id: userId });
  if (!user) return res.status(404).json({message: 'USER_NOT_FOUND', data: {id: userId}});

  const permission = await acl
      .can(requester.role)
      .context({ requester: requester._id.toString(), owner: user._id.toString() })
      .execute('delete')
      .on('user');
  if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {id: userId}});

  const { deletedCount: deletedCriteriaCount } = await CriteriaModel.deleteMany({ author: userId });
  const { deletedCount: deletedGoalsCount } = await GoalModel.deleteMany({ author: userId });
  const { deletedCount: deletedUsersCount } = await UserModel.deleteOne({ _id: userId });
  if (!deletedUsersCount) return res.status(400).json({
    message: 'USER_DELETE_FAILED',
    data: {
      details: 'Mongo can\'t delete user',
      id: userId,
    }
  });

  res.status(202).json({
    message: 'USER_DELETED',
    data: {
      user: userId,
      goalsCount: deletedGoalsCount,
      criteriaCount: deletedCriteriasCount,
    }})
});

router.put('/:userId', async (req, res) => {
  const { params: { userId }, body, user: requester } = req;
  if(!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({message: 'USER_ID_INCORRECT', data: {id: userId}});
  }

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({message: 'USER_NOT_FOUND', data: {id: userId}});
  const permission = await acl
      .can(requester.role)
      .context({ requester: requester._id.toString(), owner: user._id.toString() })
      .execute('update')
      .on('user');
  if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {id: userId}});

  return await updateModel(user, permission, body, res, 'USER_SAVED', 'USER_UPDATE_FAILED');
});

router.put('/promote/:userId', async (req, res) => {
  const { params: { userId }, body: { role }, user: requester } = req;
  if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({message: 'USER_ID_INCORRECT', data: {id: userId}});
  if (!['admin', 'user'].includes(role)) return res.status(400).json({message: 'USER_ROLE_INCORRECT', data: {id: userId}});

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({message: 'USER_NOT_FOUND', data: {id: userId}});
  const permission = await acl
      .can(requester.role)
      .execute('promote')
      .on('user');
  if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {id: userId}});

  user.set({role});

  try {
    await user.save();
    return res.status(202).json({message: 'USER_PROMOTED', data: {id: userId}})
  } catch (err) {
    return res.status(400).json({message: 'USER_UPDATE_FAILED', data: {details: err}});
  }
});

module.exports = router;
