

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/adminModel');
const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const Creator = require('../models/creatorModel');
const Manager = require('../models/managerModel');

// Middleware for protecting routes
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if the token belongs to Admin
            const admin = await Admin.findById(decoded.id).select('-password');
            if (admin) {
                req.user = admin; // Attach Admin data to req.user
                req.userRole = 'admin'; // Specify the role as Admin
                return next();
            }

            // Check if the token belongs to Doctor
            const doctor = await Doctor.findById(decoded.id).select('-password');
            if (doctor) {
                req.user = doctor; // Attach Doctor data to req.user
                req.userRole = 'doctor'; // Specify the role as Doctor
                return next();
            }

            // Check if the token belongs to Patient
            const patient = await Patient.findById(decoded.id).select('-password');
            if (patient) {
                req.user = patient; // Attach Patient data to req.user
                req.userRole = 'patient'; // Specify the role as Patient
                return next();
            }

            // Check if the token belongs to Creator
            const creator = await Creator.findById(decoded.id).select('-password');
            if (creator) {
                req.user = creator; // Attach Creator data to req.user
                req.userRole = 'creator'; // Specify the role as Creator
                return next();
            }

            // Check if the token belongs to Manager
            const manager = await Manager.findById(decoded.id).select('-password');
            if (manager) {
                req.user = manager; // Attach Manager data to req.user
                req.userRole = 'manager'; // Specify the role as Manager
                return next();
            }

            // If no valid user is found
            res.status(401);
            throw new Error('Not authorized, user not found');
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }
});

// Middleware to restrict access to Doctors only
const doctorProtect = asyncHandler(async (req, res, next) => {
    if (req.userRole !== 'doctor') {
        res.status(403);
        throw new Error('Access denied. Only doctors can access this resource.');
    }
    next();
});

// Middleware to restrict access to Admins only
const adminProtect = asyncHandler(async (req, res, next) => {
    if (req.userRole !== 'admin') {
        res.status(403);
        throw new Error('Access denied. Only admins can access this resource.');
    }
    next();
});

// Middleware to restrict access to Patients only
const patientProtect = asyncHandler(async (req, res, next) => {
    if (req.userRole !== 'patient') {
        res.status(403);
        throw new Error('Access denied. Only patients can access this resource.');
    }
    next();
});

// Middleware to restrict access to Creators only
const creatorProtect = asyncHandler(async (req, res, next) => {
    if (req.userRole !== 'creator') {
        res.status(403);
        throw new Error('Access denied. Only creators can access this resource.');
    }
    next();
});

// Middleware to restrict access to Managers only
const managerProtect = asyncHandler(async (req, res, next) => {
    if (req.userRole !== 'manager') {
        res.status(403);
        throw new Error('Access denied. Only managers can access this resource.');
    }
    next();
});

module.exports = {
    protect,
    doctorProtect,
    adminProtect,
    patientProtect,
    creatorProtect,
    managerProtect,
};
