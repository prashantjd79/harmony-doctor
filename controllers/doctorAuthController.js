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


const loginDoctor = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // **Check If Doctor is Approved**
    if (!doctor.isApproved) {
        return res.status(403).json({ message: "Your account is not approved yet. Please wait for admin approval." });
    }

    // **Compare Passwords**
    const isMatch = await doctor.matchPassword(password);

    console.log("🔍 Doctor Found:", doctor.email);
    console.log("Stored Hashed Password:", doctor.password);
    console.log("Password Match Result:", isMatch);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // **Generate JWT Token**
    const token = generateToken(doctor._id);

    res.status(200).json({
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        isApproved: doctor.isApproved,
        token // ✅ Now, the response includes a valid JWT token
    });
});








module.exports = { doctorSignup,loginDoctor };
