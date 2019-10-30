const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');

/* GET users listing. */
router.get('/', async ({query: {skip:offset = 0, limit = 10}}, res) => {
  try {
    return res.status(200).json(await UserModel.paginate({}, {offset: parseInt(offset), limit: parseInt(limit)}))
  } catch (err) {
    return res.status(400).json({err: 'USER_FETCH_FAILED', msg: err});
  }
});

router.post('/', ({body}, res) => {
  const newUser = new UserModel({...body});
  newUser.save(err => {
    if (err) return res.status(400).json({err: 'USER_CREATE_FAILED', msg: err});
    res.status(201).json({msg: 'USER_CREATED', id: newUser._id})
  });
});

router.delete('/:userId', async ({params: { userId }, body}, res) => {
  const users = await UserModel.find({ _id:userId });
  if (!users.length) return res.status(404).json({err: 'USER_NOT_FOUND', id: userId});

  const { deletedCount } = await UserModel.deleteOne({ _id:userId });
  if (!deletedCount) return res.status(400).json({err: 'USER_DELETE_FAILED', msg: err});

  res.status(202).json({msg: 'USER_DELETED', id: userId})
});

router.put('/:userId', async ({params: { userId }, body}, res) => {
  const user = await UserModel.findOne({ _id:userId });
  if (!user) return res.status(404).json({err: 'USER_NOT_FOUND', id: userId});
  for (let [field, { update }] of Object.entries(user.schema.obj)) {
    if (!update) continue;
    if(field in body) {
      user.set({[field]: body[field]});
    }
  }

  try {
    await user.save();
    return res.status(202).json({msg: 'USER_SAVED', id: userId})
  } catch (err) {
    return res.status(400).json({err: 'USER_UPDATE_FAILED', msg: err});
  }
});

module.exports = router;
