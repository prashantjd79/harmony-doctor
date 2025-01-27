const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Doctor = require('../models/doctorModel');

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
const doctorLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });

    if (doctor && (await doctor.matchPassword(password))) {
        if (!doctor.isApproved) {
            res.status(403);
            throw new Error('Doctor not approved by admin');
        }

        res.status(200).json({
            _id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
            token: generateToken(doctor.id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

module.exports = { doctorSignup, doctorLogin };
