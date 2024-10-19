const nodemailer = require('nodemailer');

// Create a transporter
let transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any other email service
    auth: {
        user: 'bdevi2472@gmail.com',
        pass: 'nluw aago wwjf imso'
    }
});

// Email options
let mailOptions = {
    from: 'bdevi2472@gmail.com',
    to: 'ruthlessdestroyer085@gmail.com',
    subject: 'Confirmation mail from ARMSCON 2024',
    html: `<h1>Hey Akshansh kumar </h1><p>We welcome you to the sail with us, let's sail together this year at ARMSCON 2024</p> 
           <h2>Your plan: BR + full day workshops has been activated</h2><br/>
           If you have any queries then feel free to contact:<br/> 
           <b>AKSHANSH KUMAR GANDAS: 6396233297</b><br/> 
           <b>YASH GOYAL: 8447566490</b><br/> 
           <b>RAHUL VERMA: 9817197984</b><br/><br/><br/> 
           <small>&copy;ARMSCON 2024</small>`
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Email sent: ' + info.response);
});
