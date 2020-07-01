const express=require('express');
const { check } = require('express-validator');
const {requiredSignin}=require('../controllers/auth');
const {userById,
  allUsers,
  getUser,
  updateProfile,
  deleteUser,
  userPhoto,
  addFollower,
  addFollowing,
  removeFollower,
  removeFollowing,
  findPeople,
  hasAuthorization
}=require('../controllers/user');

const router=express.Router();


router.put('/user/follow',requiredSignin,addFollowing,addFollower);
router.put('/user/unfollow',requiredSignin,removeFollower,removeFollowing);
router.get('/users',allUsers);
router.get('/user/:userId',requiredSignin,getUser);
router.put('/user/:userId',requiredSignin,hasAuthorization,updateProfile);
router.delete('/user/:userId',requiredSignin,hasAuthorization,deleteUser);


//who to follow
router.get('/user/findPeople/:userId',requiredSignin,findPeople);

//whenever a route has param userid,userById controller func is called
//loads the user details to req.profile property
router.get('/user/photo/:userId',userPhoto);
router.param('userId',userById);

module.exports=router;
