const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');

/* GET users listing. */
router.get('/', (req, res) => {
  UserModel.find({}, (err, users) => {
    if (err) return res.status(400).json({err: 'USER_FETCH_FAILED', msg: err});
    res.status(200).json({data: users})
  })
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

router.post('/login', async ({body: {login, passwd}}, res) => {
  const user = await UserModel.findOne({login});
  if (!user) return res.status(404).json({err: 'USER_NOT_FOUND', login});

  const validate = await user.validatePassword(passwd);
  if (!validate) return res.status(401).json({err: 'ACCESS_DENIED', login});

  res.json(user)
});

module.exports = router;
