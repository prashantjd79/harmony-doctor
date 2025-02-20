const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email password or app password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}`);
    } catch (error) {
        console.error(`❌ Email sending failed: ${error.message}`);
        throw new Error("Failed to send email");
    }
};

module.exports = sendEmail;
