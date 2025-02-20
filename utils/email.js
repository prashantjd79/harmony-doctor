// const nodemailer = require("nodemailer");

// const sendEmail = async (to, subject, text) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL_USER, // Your email
//                 pass: process.env.EMAIL_PASS, // Your email password or app password
//             },
//         });

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to,
//             subject,
//             text,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`✅ Email sent to ${to}`);
//     } catch (error) {
//         console.error(`❌ Email sending failed: ${error.message}`);
//         throw new Error("Failed to send email");
//     }
// };

// module.exports = sendEmail;

const nodemailer = require("nodemailer");

const sendEmail = async (recipient, subject, text) => {
    try {
        // **Handle different function call formats**
        let to;
        if (typeof recipient === "object") {
            // Called as: sendEmail({ to, subject, text })
            to = recipient.to;
            subject = recipient.subject;
            text = recipient.text;
        } else {
            // Called as: sendEmail(to, subject, text)
            to = recipient;
        }

        if (!to) {
            throw new Error("No recipients defined");
        }

        console.log(`📧 Sending Email to: ${to}`); // ✅ Debugging log

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email password or app password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to, // ✅ Ensure recipient email is defined
            subject,
            text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`, info.response);
        return info;
    } catch (error) {
        console.error(`❌ Email sending failed: ${error.message}`);
        throw new Error("Failed to send email");
    }
};

module.exports = sendEmail;
