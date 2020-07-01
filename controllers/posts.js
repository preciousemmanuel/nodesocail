const Post=require('../models/post');
const {  validationResult } = require('express-validator');
const formidable=require('formidable');
const fs=require('fs');
const _=require('lodash');


exports.postById=(req,res,next,id)=>{
  Post.findById(id)
  .populate('postedBy')

  .populate('comments.postedBy','_id name')
  .exec((err,post)=>{
    if (err) {
      return res.status(400).json({error:err});
    }
    req.post=post;
    next();
  })
}
exports.getPosts=(req,res)=>{
    const posts=Post.find().select("_id title body created_at likes")
    .sort({created_at:-1})
    .populate('postedBy')

    .populate('comments.postedBy','_id name')
    .then((posts)=>{
        res.json(posts)
    })
    .catch(error=>console.log(error))

}

exports.createPost=(req,res,next)=>{

    const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const firstError=errors.array().map(error=>error.msg)[0]
    return res.status(400).json({ error: firstError });
  }

  let form=new formidable.IncomingForm();
  //formidable is use to parse form body especialy form request with image
  form.keepExtensions=true;
console.log("post")
  //parses the form request
  form.parse(req,(err,fields,files)=>{
    if (err) {
        return res.status(400).json({error:"image could not be uploaded"})
    }
    let post=new Post(fields);
    post.postedBy=req.profile;
    console.log(files)
    if (files.photo) {
      post.photo.data=fs.readFileSync(files.photo.path)
      post.photo.contentType=files.photo.type
    }
    console.log(fields)
    post.save((err,result)=>{
      if(err) return res.status(400).json({error:err});
      res.json(result);
    })
  })
  // const post=new Post(req.body)
  //   post.save().then(result=>{
  //       console.log("SAVE POST",result)
  //       res.status(200).json({
  //           result
  //       })
  //   })
    //post.save((err,result)=>{
        // if(err){
        //     return res.status(400).json({
        //         err
        //     })
        // }
        // res.status(200).json({
        //     result
        // })


}
exports.postByUser=(req,res)=>{
  Post.find({postedBy:req.profile._id})
  .populate("postedBy")
  .sort("_created_at")
  .exec((error,posts)=>{
    if (error) {
      return res.status(400).json({error});
    }
    res.json(posts)
  })
}

exports.isPoster=(req,res,next)=>{
  console.log("tests",req.post)
  console.log("tests",req.auth)

  let sameUser=req.post && req.auth && req.post.postedBy._id==req.auth._id;
  let adminUser=req.post && req.auth.role==="admin";
  
  let isPoster= sameUser || adminUser;
  if (!isPoster) {
    return res.status(403).json({error:"User is not authorized"})
  }
  next();
}

//
// exports.updatePost=(req,res,next)=>{
//   let post=req.post;
//   post=_.extend(post,req.body);
//   console.log(req.body)
//   post.updated_at=Date.now();
//   post.save(err=>{
//     if (err) {
//       return res.status(400).json({error:err});
//     }
//     res.json(post)
//   })
// }

exports.updatePost=(req,res,next)=>{
  const errors = validationResult(req);
if (!errors.isEmpty()) {
    const firstError=errors.array().map(error=>error.msg)[0]
  return res.status(400).json({ errors: firstError });
}

//this is for handling form data...form with photo
  let form=new formidable.IncomingForm();
  form.keepExtensions=true;
  form.parse(req,(err,fields,files)=>{
    if (err) {
      return res.status(400).json({error:"Photo could not be uploaded!"})
    }
    let post=req.post
    post=_.extend(post,fields)
    post.updated_at=Date.now()
    if (files.photo) {
      post.photo.data=fs.readFileSync(files.photo.path);
      post.photo.contentType=files.photo.type;
    }

    post.save((err,result)=>{
      if(err){
        return res.status(400).json({error:err});
      }
      res.json(post)
    })
  })

}

exports.like=(req,res)=>{
  console.log(req.body,"tr")
  Post.findByIdAndUpdate(req.body.postId,{$push:{likes:req.body.userId}},{new:true})
  .exec((error,result)=>{
    if (error) {
      return res.status(404).json({error})
    } else {
      return res.json(result)
    }
  })
}

exports.unLike=(req,res)=>{
  Post.findByIdAndUpdate(req.body.postId,{$pull:{likes:req.body.userId}},{new:true})
  .exec((error,result)=>{
    if (error) {
      return res.status(404).json({error})
    } else {
      return res.json(result)
    }
  })
}


exports.deletePost=(req,res)=>{
  let post=req.post;
  post.remove((err,post)=>{
    if (err) {
      return res.status(400).json({error:err})
    }
    res.json({message:"Post deleted successfully"})
  })
}

exports.photo=(req,res,next)=>{
  res.set("Content-Type",req.post.photo.contentType);
  return res.send(req.post.photo.data);
}

exports.singlePost=(req,res)=>{
  return res.json(req.post)
}

exports.comment=(req,res)=>{
  let comment=req.body.comment;
  comment.postedBy=req.body.userId
  Post.findByIdAndUpdate(req.body.postId,{$push:{comments:comment}},{new:true})
  .populate('comments.postedBy')
  .populate('postedBy')
  .exec((error,result)=>{
    if (error) {
      return res.status(404).json({error})
    } else {
      return res.json(result)
    }
  })
}
exports.uncomment=(req,res)=>{
    let comment=req.body.comment;
  Post.findByIdAndUpdate(req.body.postId,{$pull:{comments:{_id:comment._id}}},{new:true})
  .populate('postedBy')
  .populate('comments.postedBy')
  .exec((error,result)=>{
    if (error) {
      return res.status(404).json({error})
    } else {
      return res.json(result)
    }
  })
}
