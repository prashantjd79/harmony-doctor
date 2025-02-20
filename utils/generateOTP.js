const otpStore = {}; // Store OTPs in memory (email: otp mapping)

const generateOTP = (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    otpStore[email] = otp; // Store OTP mapped to email
    setTimeout(() => delete otpStore[email], 300000); // Delete OTP after 5 minutes
    return otp;
};

const verifyOTP = (email, enteredOTP) => {
    return otpStore[email] === enteredOTP;
};

module.exports = { generateOTP, verifyOTP };
