const nodemailer=require('nodemailer');
const defaultEmailData = {from:"noreply@node-react.com"};

exports.sendMail=emailData=>{

  const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    //requireTLS:true,
    auth:{
      user:"preciousemmanuel32@gmail.com",
      pass:"Developer19@"
    }
  });

  return (
    transporter
    .sendMail(emailData)
    .then(info=>console.log(`Message sent: ${info.response} `))
    .catch(error=>console.log(error))
  )
}
