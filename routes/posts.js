const express=require('express');
const { check } = require('express-validator');

const {getPosts,createPost,postByUser,postById,isPoster,deletePost,updatePost,photo,singlePost,like
  ,unLike,comment,uncomment}=require('../controllers/posts');
const {requiredSignin}=require('../controllers/auth');
const {userById}=require('../controllers/user');
// const {createPostValidator}=require('../validator')

const router=express.Router();

router.get('/posts',getPosts)
router.put('/post/like',requiredSignin,like);
router.put('/post/unlike',requiredSignin,unLike);

router.put('/post/comment',requiredSignin,comment);
router.put('/post/uncomment',requiredSignin,uncomment);

router.post('/post/new/:userId',requiredSignin,createPost,[
    check('title','Title must not be empty').notEmpty(),
    check("title","Title must be between 4 and 150 characters")
    .isLength({
        min:4,max:150
    }),
    check('body','Body must not be empty').notEmpty(),
    check("body","Body must be between 4 and 2000 characters")
    .isLength({
        min:4,max:2000
    })
])

router.get('/posts/by/:userId',postByUser);
router.get('/post/:postId',singlePost);
router.put('/post/:postId',requiredSignin,isPoster,updatePost);
router.delete('/post/:postId',requiredSignin,isPoster,deletePost);
router.get('/post/photo/:postId',photo);

//whenever a route has param userid,userById controller func is called
//loads the user details to req.profile property

router.param('userId',userById)
router.param('postId',postById)

module.exports=router;
