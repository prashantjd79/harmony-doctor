const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your preferred email service
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your email password
        },
    });

    const mailOptions = {
        from: 'yourapp@example.com',
        to,
        subject,
        text,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
