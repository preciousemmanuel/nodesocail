const jwt=require('jsonwebtoken');
const _=require('lodash');
const {sendMail}=require('../helpers')
require('dotenv').config()
const User=require('../models/user');
const { validationResult } = require('express-validator');
const expressJwt = require('express-jwt');

exports.signup= async (req,res)=>{
const errors=validationResult(req);
if(!errors.isEmpty()){
    const firstError=errors.array().map((error)=>error.msg)[0];
    return res.status(400).json({error:firstError})
}
const userExist=await User.findOne({email:req.body.email});
if(userExist) return res.status(403).json({error:"Email taken!"})

const user =await new User(req.body)
await user.save();
res.status(200).json({user})
}

exports.signin=async (req,res)=>{
    const {email,password}=req.body;
    //try {
    console.log(req.body)
        let user=await User.findOne({email});
        if(!user) return res.status(401).json({error:"User with email do not exist"});
        //create authenticate model and use here...
        if(!user.authenticated(password)) return res.status(403).json({error:"User and password do not match"})
        const token = jwt.sign({_id:user.id,role:user.role},process.env.JWT_SECRET)
        //persist the token as 't' in cookie with expiry date
        res.cookie('t',token,{expire:Date.now()+9999})
        //return response to user
        return res.json({token,user})

    // } catch (error) {
    //     return res.status(500).json({error:"failed"})
    // }
}

exports.signout=(req,res)=>{
    res.clearCookie('t');
    return res.json({message:"Signout successful"})
}

exports.forgotPassword=async (req,res)=>{
  if (!req.body.email) {
    return res.status(401).json({error:"No Email in request body"})
  }
  try {
    const user = await User.findOne({email:req.body.email});
    if (!user) {
      return res.status(401).json({error:"User with Email do not exist"});
    }

    // generate a token with user id and secret
    const token = jwt.sign({_id:user.id,iss:"NODEAPI"},process.env.JWT_SECRET);

    //email data
    const emailData={
      from:"no-reply@node-react.com",
      to:req.body.email,
      subject:"Reset Password",
      text:`Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
      html:`<p> Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}</p>`
    };

    const updatedUser=await user.updateOne({resetPasword:token});
    if(!updatedUser){
      return res.json({message:"error"})
    }

    sendMail(emailData);
    console.log("working email sent")
    return res.json({message:`Email has been sent to ${req.body.email}. Follow the instructions to reset your password.`})

  } catch (e) {
      res.status(401).json({error:e})
  }

}

exports.resetPassword=(req,res)=>{
  const {resetPaswordLink,newPassword}=req.body;
  User.findOne(resetPaswordLink,(err,user)=>{
    if (err || !user) {
      return res.status(401).json({error:"Invalid link"})
    }
    const resetPasword={
      password:newPassword,
      resetPaswordLink:""
    };

    user = _.extend(user,resetPasword);
    user.updated_at=Date.now()
    user.save((err,result)=>{
      if (err) {
               return res.status(400).json({
                   error: err
               });
           }
           res.json({
               message: `Great! Now you can login with your new password.`
           });
    })

  })
}

exports.socialLogin=(req,res)=>{
  let user=User.findOne({email:req.body.email},(err,user)=>{
    if (err||!user) {
      //create new
      user=new User(req.body);
      req.profile=user;
      user.save()
      //generate token with user // ID
      const token=jwt.sign({_id:user._id,iss:"NODEAPI"},process.env.JWT_SECRET);
      res.cookie("t",token,{expire:new Date()+9999})
      //return response with user token and details
      return res.json({user,token})
    } else {
      //upddate user
      req.profile=user;
      user=_.extend(user,req.body);
      user.updated_at=Date.now;
      user.save();
      //generate token with user // ID
      const token=jwt.sign({_id:user._id,iss:"NODEAPI"},process.env.JWT_SECRET);
      res.cookie("t",token,{expire:new Date()+9999})
      //return response with user token and details
      return res.json({user,token})
    }
  })
}

//express jwt is used to protect routes
exports.requiredSignin=expressJwt({
    //if the token is valid ,expres jwt appends the verified users id
    //in an auth key to the request object
    secret:process.env.JWT_SECRET,
    userProperty:'auth'
})
