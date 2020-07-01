const express=require('express');
const { check } = require('express-validator');

const {signup,signin,signout,resetPassword,forgotPassword,socialLogin}=require('../controllers/auth');

const {userById}=require('../controllers/user');

const router=express.Router();


router.post('/signup',[
    check("name","Name must not be empty").notEmpty(),
check("email","Email must not be empty").notEmpty(),
check("password","Password must not be empty").notEmpty(),
check("password").isLength({
    min:4
}).withMessage("Password length must be more than 4 characters")
.matches(/\d/).withMessage("Password must contain a digit"),


],signup)

router.put('/forgot-password',forgotPassword);
router.put('/reset-password',[
  check("newPassword","Password must not be empty").notEmpty(),
  check("newPassword")
  .isLength({min:6})
  .withMessage("Password must be at least 6 characters")
  .matches(/\d/)
  .withMessage("Password must contain a number")
],resetPassword);

router.post('/signin',signin)

router.get('/signout',signout)

router.put('/social-login',socialLogin)

//whenever a route has param userid,userById controller func is called
//loads the user details to req.profile property

router.param('userId',userById)
module.exports=router;
