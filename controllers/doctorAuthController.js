const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Doctor = require('../models/doctorModel');
const bcrypt = require('bcryptjs');
// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Doctor Signup


const doctorSignup = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        specialization,
        qualifications,
        experience,
        profilePicture,
        contactNumber,
        username,
        topEducation,
        expertiseCategories,
        country,
        state,
        attachedFiles,
        description,
    } = req.body;

    // Check if the doctor already exists
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
        res.status(400);
        throw new Error('Doctor already exists');
    }

    // Create a new doctor
    const doctor = await Doctor.create({
        name,
        email,
        password,
        specialization,
        qualifications,
        experience,
        profilePicture,
        contactNumber,
        username,
        topEducation,
        expertiseCategories,
        country,
        state,
        attachedFiles,
        description,
    });

    if (doctor) {
        res.status(201).json({
            _id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
            isApproved: doctor.isApproved,
            message: 'Signup successful. Please wait for admin approval.',
        });
    } else {
        res.status(400);
        throw new Error('Invalid doctor data');
    }
});





// const doctorSignup = asyncHandler(async (req, res) => {
//     const { name, email, password, specialization, qualifications, experience, profilePicture } = req.body;

//     const doctorExists = await Doctor.findOne({ email });

//     if (doctorExists) {
//         res.status(400);
//         throw new Error('Doctor already exists');
//     }

//     const doctor = await Doctor.create({
//         name,
//         email,
//         password,
//         specialization,
//         qualifications,
//         experience,
//         profilePicture,
//     });

//     if (doctor) {
//         res.status(201).json({
//             _id: doctor.id,
//             name: doctor.name,
//             email: doctor.email,
//             specialization: doctor.specialization,
//             isApproved: doctor.isApproved,
//             message: 'Signup successful. Please wait for admin approval.',
//         });
//     } else {
//         res.status(400);
//         throw new Error('Invalid doctor data');
//     }
// });

// Doctor Login
const loginDoctor = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log("🔍 Login Request Received");
    console.log("Email:", email);

    // Find doctor
    const doctor = await Doctor.findOne({ email: email.trim() });

    if (!doctor) {
        console.log("❌ Doctor not found in database");
        return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("✅ Doctor Found:", doctor.email);
    console.log("Stored Hashed Password:", doctor.password);

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, doctor.password);
    console.log("Password Match Result:", isMatch);

    if (!isMatch) {
        console.log("❌ Password does not match");
        return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("✅ Login Successful");
    res.status(200).json({
        message: "Login successful",
        doctor: {
            _id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
            token: generateToken(doctor._id),
        },
    });
});




module.exports = { doctorSignup,loginDoctor };
