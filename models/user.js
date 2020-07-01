const mongoose=require('mongoose');
const uuidv1 = require('uuid/v1');
const crypto = require('crypto');
const {ObjectId} =mongoose.Schema;

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    hash_password:{
        type:String,
        required:true
    },
    salt:String,
    created_at:{
        type:Date,
        default:Date.now
    },
    updated_at:Date,
    photo:{
      data:Buffer,
      contentType:String
    },
    about:{
      type:String,
      trim:true
    },
    role:{
      type:String,
      default:"subscriber"
    }
    following:[{type:ObjectId,ref:'User'}],
    followers:[{type:ObjectId,ref:'User'}],
    resetPaswordLink:{
      type:String,
      default:""
    }
})

//virtual attributes helps u persists model attributes data to db
//If you want attributes that you can get and set but
// that are not themselves persisted to mongodb, virtual attributes is the Mongoose feature for you.
userSchema.virtual("password")
.set(function (password){
    //create temporary variable _password
    this._password=password;
    //generate timestamp
    this.salt=uuidv1();
    this.hash_password=this.encryptedPassword(password)
})
.get(()=>{
    return this._password
})

userSchema.methods={
    authenticated:function(plainPassword){
        return this.encryptedPassword(plainPassword)===this.hash_password;
    },
    encryptedPassword:function (password){
        if(!password) return "";
        try {
            return crypto.createHmac('sha1', this.salt)
            .update(password)
            .digest('hex');
        } catch (error) {
            return ""
        }
    },
    toJSON:function(){
        let obj=this.toObject();
        ["hash_password","salt"].forEach(function(item){
            delete obj[item];
        })

        return obj;
    }
}

module.exports=mongoose.model("User",userSchema)
