
const Manager = require('../models/managerModel');

const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const Service = require('../models/serviceModel');
const Session = require('../models/sessionModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
const { sendEmail } = require('../utils/email');
const { addAppNotification } = require('../utils/notifications');

/**
 * @desc Get all categories
 * @route GET /api/doctors/categories
 * @access Protected (Doctor)
 */
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    if (!categories || categories.length === 0) {
        return res.status(404).json({ message: 'No categories found' });
    }
    res.status(200).json(categories);
});

/**
 * @desc Get all services
 * @route GET /api/doctors/services
 * @access Protected (Doctor)
 */
const getServices = asyncHandler(async (req, res) => {
    const services = await Service.find({}).populate('category', 'name');
    if (!services || services.length === 0) {
        return res.status(404).json({ message: 'No services found' });
    }
    res.status(200).json(services);
});

/**
 * @desc Get upcoming sessions for the doctor
 * @route GET /api/doctors/upcoming-sessions
 * @access Protected (Doctor)
 */
const viewUpcomingSessions = asyncHandler(async (req, res) => {
    const doctorId = req.user._id; 

    const sessions = await Session.find({
        doctor: doctorId,
        date: { $gte: new Date() },
        status: 'Scheduled',
    })
    .populate('patient', 'name')
    .populate('service', 'name duration')
    .sort({ date: 1, timeSlot: 1 });

    if (!sessions || sessions.length === 0) {
        return res.status(404).json({ message: 'No upcoming sessions found' });
    }

    res.status(200).json({ message: 'Upcoming sessions retrieved successfully.', sessions });
});

/**
 * @desc View a patient's profile
 * @route GET /api/doctors/patients/:patientId
 * @access Protected (Doctor)
 */
const viewPatientProfile = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId).select('name age gender address');

    if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json(patient);
});

/**
 * @desc Set pricing for a service
 * @route PUT /api/doctors/services/:serviceId/pricing
 * @access Protected (Doctor)
 */
const enrollPricing = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { fee } = req.body;
    const doctorId = req.user._id; 

    if (!fee || fee <= 0) {
        return res.status(400).json({ message: 'Valid fee is required' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }

    const existingPricing = service.doctorPricing.find(
        (pricing) => pricing.doctor.toString() === doctorId.toString()
    );

    if (existingPricing) {
        existingPricing.fee = fee;
    } else {
        service.doctorPricing.push({ doctor: doctorId, fee });
    }

    await service.save();

    res.status(200).json({ message: 'Pricing enrolled/updated successfully', service });
});

/**
 * @desc Update doctor's availability
 * @route PUT /api/doctors/availability
 * @access Protected (Doctor)
 */
const updateAvailability = asyncHandler(async (req, res) => {
    const doctorId = req.user._id; 
    const { date, slots } = req.body;

    if (!date || !slots || !Array.isArray(slots)) {
        return res.status(400).json({ message: 'Date and slots are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }

    const existingAvailability = doctor.availability.find(
        (availability) => availability.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (existingAvailability) {
        existingAvailability.slots = slots;
    } else {
        doctor.availability.push({ date, slots });
    }

    await doctor.save();

    res.status(200).json({ message: 'Availability updated successfully', availability: doctor.availability });
});

// /**
//  * @desc Fetch all sessions of a doctor
//  * @route GET /api/doctors/all-sessions
//  * @access Protected (Doctor)
//  */
// const getAllDoctorSessions = asyncHandler(async (req, res) => {
//     const doctorId = req.user._id;

//     const sessions = await Session.find({ doctor: doctorId })
//         .populate('patient', 'name email')
//         .populate('service', 'name')
//         .sort({ date: -1 });

//     if (!sessions || sessions.length === 0) {
//         return res.status(404).json({ message: "No session history found." });
//     }

//     res.status(200).json({ message: "All sessions retrieved successfully.", sessions });
// });


/**
 * @desc    Get all sessions for the logged-in doctor
 * @route   GET /api/doctor/sessions
 * @access  Protected (Doctor)
 */
const getDoctorSessions = asyncHandler(async (req, res) => {
    try {
        const doctorId = req.user.id; // Get doctor ID from token

        console.log(`🔍 Fetching all sessions for Doctor ID: ${doctorId}`);

        const sessions = await Session.find({ doctor: doctorId })
            .populate('patient', 'name email') 
            .populate('service', 'name')
            .sort({ date: -1 });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: "No sessions found." });
        }

        res.status(200).json({
            message: "Doctor's sessions retrieved successfully.",
            sessions,
        });
    } catch (error) {
        console.error("🚨 Error retrieving sessions:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});


const getDoctorProfile = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.user._id).select('-password'); // Exclude password

    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    res.status(200).json(doctor);
});

const updateDoctorProfile = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.user._id);

    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    // Update only the fields that are provided
    doctor.name = req.body.name || doctor.name;
    doctor.email = req.body.email || doctor.email;
    doctor.specialization = req.body.specialization || doctor.specialization;
    doctor.experience = req.body.experience || doctor.experience;
    doctor.profilePicture = req.body.profilePicture || doctor.profilePicture;
    doctor.availability = req.body.availability || doctor.availability;

    const updatedDoctor = await doctor.save();
    res.status(200).json(updatedDoctor);
});

const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
        res.status(404);
        throw new Error("Service not found");
    }

    res.status(200).json(service);
});
const getManagerDetails = asyncHandler(async (req, res) => {
    const manager = await Manager.findById(req.params.managerId).select('-password');

    if (!manager) {
        res.status(404);
        throw new Error("Manager not found");
    }

    res.status(200).json(manager);
});

const getPatientDetails = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.patientId).select('-password');

    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    // Fetch past sessions with this patient
    const sessionHistory = await Session.find({ patient: req.params.patientId, doctor: req.user._id })
        .populate('service', 'name price')
        .sort({ date: -1 });

    res.status(200).json({ patient, sessionHistory });
});
const getCompletedSessions = asyncHandler(async (req, res) => {
    const completedSessionsCount = await Session.countDocuments({
        doctor: req.user._id,
        status: "Completed",
    });

    res.status(200).json({ completedSessions: completedSessionsCount });
});
const getServicesEnrolled = asyncHandler(async (req, res) => {
    const doctorServices = await Service.find({ "doctorPricing.doctor": req.user._id });

    res.status(200).json({ servicesEnrolled: doctorServices.length });
});

module.exports = { 
    getCategories, 
    getServices, 
    viewUpcomingSessions, 
    viewPatientProfile, 
    enrollPricing, 
    updateAvailability, 
    getDoctorSessions,
    getDoctorProfile,
    updateDoctorProfile,
    getServiceById,getManagerDetails,getPatientDetails,getCompletedSessions,getServicesEnrolled
};
