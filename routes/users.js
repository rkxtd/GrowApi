const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const {query: {skip:offset = 0, limit = 10}, user} = req;
  const acl = user.acl();
  const permission = await acl
      .can(user.role)
      .execute('read')
      .on('users');
  if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: user._id});

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
    return res.status(400).json({err: 'USER_FETCH_FAILED', msg: err});
  }
});

router.post('/', ({body}, res) => {
  const newUser = new UserModel({...body, role: 'user'});
  newUser.save(err => {
    if (err) return res.status(400).json({err: 'USER_CREATE_FAILED', msg: err});
    res.status(201).json({msg: 'USER_CREATED', id: newUser._id})
  });
});

router.delete('/:userId', async ({params: { userId }, body, user: requester}, res) => {
  const user = await UserModel.findOne({ _id:userId });
  if (!user) return res.status(404).json({err: 'USER_NOT_FOUND', id: userId});

  const acl = user.acl();
  const permission = await acl
      .can(requester.role)
      .context({ requester: requester._id.toString(), owner: user._id.toString() })
      .execute('delete')
      .on('user');
  if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: userId});

  const { deletedCount } = await UserModel.deleteOne({ _id:userId });
  if (!deletedCount) return res.status(400).json({err: 'USER_DELETE_FAILED', msg: err});

  res.status(202).json({msg: 'USER_DELETED', id: userId})
});

router.put('/:userId', async (req, res) => {
  const { params: { userId }, body, user: requester } = req;
  if(!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({err: 'USER_ID_INCORRECT', id: userId});
  }

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({err: 'USER_NOT_FOUND', id: userId});
  const acl = user.acl();
  const permission = await acl
      .can(requester.role)
      .context({ requester: requester._id.toString(), owner: user._id.toString() })
      .execute('update')
      .on('user');
  if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: userId});
  const allUpdateFields = user.getUpdateFields();
  let updateFields;
  if (permission.attributes[0] === '*') {
    updateFields = allUpdateFields;
  } else {
    updateFields = allUpdateFields.filter(value => -1 !== permission.attributes.indexOf(value))
  }

  const warnings = [];
  for (let field of Object.keys(body)) {
    if(updateFields.includes(field)) {
      user.set({[field]: body[field]});
    } else {
      warnings.push({msg: 'FIELD_UPDATE_ERROR', data: field});
    }
  }

  try {
    await user.save();
    if (warnings.length) {
      return res.status(202).json({msg: 'USER_SAVED', id: userId, warnings })
    } else {
      return res.status(202).json({msg: 'USER_SAVED', id: userId})
    }

  } catch (err) {
    return res.status(400).json({err: 'USER_UPDATE_FAILED', msg: err});
  }
});

router.put('/promote/:userId', async (req, res) => {
  const { params: { userId }, body: { role }, user: requester } = req;
  if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({err: 'USER_ID_INCORRECT', id: userId});
  if (!['admin', 'user'].includes(role)) return res.status(400).json({err: 'USER_ROLE_INCORRECT', id: userId});

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({err: 'USER_NOT_FOUND', id: userId});
  const acl = user.acl();
  const permission = await acl
      .can(requester.role)
      .execute('promote')
      .on('user');
  if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', id: userId});

  user.set({role});

  try {
    await user.save();
    return res.status(202).json({msg: 'USER_PROMOTED', id: userId})
  } catch (err) {
    return res.status(400).json({err: 'USER_UPDATE_FAILED', msg: err});
  }
});

module.exports = router;
