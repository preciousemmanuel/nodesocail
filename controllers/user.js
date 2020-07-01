const User=require('../models/user');
const _ = require('lodash');
const formidable=require('formidable');
const fs=require('fs');
const {  validationResult } = require('express-validator');

exports.userById=async (req,res,next,id)=>{
    try {
        let user=await User.findById(id)
        .populate('following','_id name')
        .populate('followers','_id name');
    if(!user) return res.status(400).json({error:"No user found"});

    req.profile=user;
    //go to the route or other param function
    next();
    } catch (error) {
        console.log(error)
        return res.status(400).json({error})
    }

}

exports.hasAuthorization=(req,res,next)=>{
  let sameUser=req.profile && req.auth && req.profile._id==req.auth._id;
  let adminUser=req.profile && req.auth && req.auth.role==="admin";
    const authorized=sameUser || adminUser;

    if(!authorized) return res.status(403).json({error:"User is not authorized"})
    next()
}

exports.allUsers=async (req,res)=>{
    let users=await User.find();
    res.json(users);
}

exports.getUser=(req,res)=>{
    return res.json(req.profile)
}

// exports.updateProfile=(req,res,next)=>{
//   let user=req.profile;
//   user=_.extend(user,req.body);
//   user.updated_at=Date.now();
//   user.save(function(err){
//     if (err) {
//       return res.status(400).json({
//         error:"You are not authorized for this"
//       })
//     }
//     res.status(200).json({user})
//   })
// }

exports.updateProfile=(req,res,next)=>{
  const errors = validationResult(req);
if (!errors.isEmpty()) {
    const firstError=errors.array().map(error=>error.msg)[0]
  return res.status(400).json({ errors: firstError });
}

  let form=new formidable.IncomingForm();
  form.keepExtensions=true;
  form.parse(req,(err,fields,files)=>{
    if (err) {
      return res.status(400).json({error:"Photo could not be uploaded!"})
    }
    let user=req.profile
    user=_.extend(user,fields)
    user.updated_at=Date.now()
    if (files.photo) {
      user.photo.data=fs.readFileSync(files.photo.path);
      user.photo.contentType=files.photo.type;
    }

    user.save((err,result)=>{
      if(err){
        return res.status(400).json({error:err});
      }
      res.json(user)
    })
  })

}

exports.userPhoto=(req,res,next)=>{
  if (req.profile.photo.data) {
    res.set("Content-Type",req.profile.photo.contentType);
    return res.send(req.profile.photo.data);
  }
  next();
}

exports.deleteUser=(req,res)=>{
  let user=req.profile;
  user.remove(function(err,user){
    if (err) {
      return res.status(400).json({
        error:err
      })
    }
    res.json({user})
  })
}

exports.addFollowing=(req,res,next)=>{
  User.findByIdAndUpdate(req.body.userId,{$push:{following:req.body.followId}},(err,result)=>{
    if (err) {
      return res.status(400).json({error:err})
    }
    next()
  })
}

exports.addFollower=(req,res)=>{
  User.findByIdAndUpdate(req.body.followId,{$push:{followers:req.body.userId}},{new:true})
  .populate("following","_id name")
  .populate("followers","_id name")
  .exec((err,result)=>{
    if (err) {
      return res.status(400).json({error:err})
    }
    console.log(result)
    res.json(result);
  })
}

exports.removeFollowing=(req,res,next)=>{
  User.findByIdAndUpdate(req.body.userId,{$pull:{following:req.body.unfollowId}},(err,result)=>{
    if (err) {
      return res.status(400).json({error:err})
    }
    next()
  })
}

exports.removeFollower=(req,res)=>{
  User.findByIdAndUpdate(req.body.unfollowId,{$pull:{followers:req.body.userId}},{new:true})
  .populate("following","_id name")
  .populate("followers","_id name")
  .exec((err,result)=>{
    if (err) {
      return res.status(400).json({error:err})
    }
    res.json(result);
  })
}

exports.findPeople=(req,res)=>{
  let following=req.profile.following;
  following.push(req.profile._id);
  console.log(following)
  User.find({_id:{$nin:following}},(error,result)=>{
    if (error) {
      req.status(400).json({error})
    }
    res.json(result)
  })
}
