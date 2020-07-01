const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema;
const postSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        // maxlength:140,
        // minlength:4
    },
    body:{
        type:String,
        required:true,
        // maxlength:5000,
        // minlength:4
    },
    photo:{
      data:Buffer,
      contentType:String
    },
    postedBy:{
      type:ObjectId,
      ref:"User"
    },
    created_at:{
      type:Date,
      default:Date.now
    },
    updated_at:Date,
    likes:[{type:ObjectId,ref:'User'}],
    comments:[
      {
        text:String,
        created_at:{
        type:Date,
        default:Date.now
      },
      postedBy:{type:ObjectId,ref:'User'}
    }
    ]


});

module.exports=mongoose.model("Post",postSchema);
