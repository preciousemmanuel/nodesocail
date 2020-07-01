exports.createPostValidator=(req,res,next)=>{
    req.check("title","Write a title").notEmpty();
    req.check("title","Title must be between 4 and 150 characters").isLength({
        min:4,max:150
    })

    req.check("body","Write a content").notEmpty();
    req.check("body","Content must be between 4 and 2000 characters").isLength({
        min:4,max:2000
    })

    const errors=req.validationErrors();
    if(errors){
        const firstError=errors.map((error)=>error.msg)[0]
        return res.status(400).json({
            error:firstError
        })
    }
    next();
}
