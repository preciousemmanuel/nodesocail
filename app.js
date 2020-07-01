const express=require('express');
const morgan =require('morgan');
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const fs=require('fs')
const cors=require('cors')
//const expressValidator=require('express-validator');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const app=express();
const postRoutes=require('./routes/posts');
const authRoutes=require('./routes/auth');
const userRoutes=require('./routes/user');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    //useUnifiedTopology: true
  }).then(()=>console.log("DB CONNECTED")).catch((err)=>{
      console.log(err)
  })

mongoose.connection.on('error',err=>{
    console.log(`error message ${err.message}`)
})
const myOwnMiddleware=(req,res,next)=>{
    console.log('my own middleware')
    next()
}
app.get('/',(req,res)=>{
  fs.readFile('docs/apiDocs.json',(err,data)=>{
    if (err) {
      return res.status(400).json({error:err})
    }
    const docs=JSON.parse(data)
    return res.json(docs)
  })
})
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(cookieParser())
//app.use(expressValidator())
app.use(myOwnMiddleware);

app.use('/',postRoutes);
app.use('/',authRoutes);
app.use('/',userRoutes);

app.use((err,req,res,next)=>{
    if(err.name=="UnauthorizedError"){
        res.status(401).json({error:"Unauthorized"})
    }
})

const port=process.env.PORT||8080;
app.listen(port)
console.log('server is running')
