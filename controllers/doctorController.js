const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const Service = require('../models/serviceModel');
const Session = require('../models/sessionModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
const { sendEmail } = require('../utils/email');
const { addAppNotification } = require('../utils/notifications');
// Get all categories
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    if (!categories || categories.length === 0) {
        res.status(404);
        throw new Error('No categories found');
    }
    res.status(200).json(categories);
});


// Get all services
const getServices = asyncHandler(async (req, res) => {
    const services = await Service.find({}).populate('category', 'name');
    if (!services || services.length === 0) {
        res.status(404);
        throw new Error('No services found');
    }
    res.status(200).json(services);
});



const viewUpcomingSessions = asyncHandler(async (req, res) => {
    const doctorId = req.user._id; // Assuming the protect middleware attaches the logged-in doctor as `req.user`

    const sessions = await Session.find({
        doctor: doctorId,
        date: { $gte: new Date() }, // Fetch sessions from today onwards
        status: 'Scheduled', // Only fetch scheduled sessions
    })
        .populate('patient', 'name') // Fetch patient details
        .populate('service', 'name duration') // Fetch service details
        .sort({ date: 1, timeSlot: 1 }); // Sort by date and time

    if (!sessions || sessions.length === 0) {
        res.status(404);
        throw new Error('No upcoming sessions found');
    }

    res.status(200).json(sessions);
});

// View Patient Profile
const viewPatientProfile = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    // Find the patient by ID
    const patient = await Patient.findById(patientId).select('name age gender address'); // Exclude email and contact number

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    res.status(200).json(patient);
});


// Enroll Pricing/Fee for a Service
const enrollPricing = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { fee } = req.body;

    if (!fee || fee <= 0) {
        res.status(400);
        throw new Error('Valid fee is required');
    }

    const service = await Service.findById(serviceId);

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    const doctorId = req.user._id; // Get logged-in doctor ID

    // Check if the doctor already has pricing for this service
    const existingPricing = service.doctorPricing.find(
        (pricing) => pricing.doctor.toString() === doctorId.toString()
    );

    if (existingPricing) {
        // Update existing pricing
        existingPricing.fee = fee;
    } else {
        // Add new pricing
        service.doctorPricing.push({ doctor: doctorId, fee });
    }

    const updatedService = await service.save();

    res.status(200).json({
        message: 'Pricing enrolled/updated successfully',
        service: updatedService,
    });
});



// Update Availability
const updateAvailability = asyncHandler(async (req, res) => {
    const doctorId = req.user._id; // Get logged-in doctor ID
    const { date, slots } = req.body;

    if (!date || !slots || !Array.isArray(slots)) {
        res.status(400);
        throw new Error('Date and slots are required');
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    // Check if availability for the given date already exists
    const existingAvailability = doctor.availability.find(
        (availability) => availability.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (existingAvailability) {
        // Update slots for the existing date
        existingAvailability.slots = slots;
    } else {
        // Add new availability
        doctor.availability.push({ date, slots });
    }

    await doctor.save();

    res.status(200).json({
        message: 'Availability updated successfully',
        availability: doctor.availability,
    });
});
// const createSessionUnderDoctor = asyncHandler(async (req, res) => {
//     const { patientId, serviceId, date, timeSlot, name, age, address, email, contactNumber } = req.body;

//     // Ensure required fields for session are provided
//     if (!serviceId || !date || !timeSlot) {
//         res.status(400);
//         throw new Error('All fields (serviceId, date, timeSlot) are required');
//     }

//     const doctorId = req.user._id; // Logged-in doctor's ID
//     let patient;

//     // Validate or Update Patient
//     if (patientId) {
//         // Fetch the existing patient
//         patient = await Patient.findById(patientId);
//         if (!patient) {
//             res.status(404);
//             throw new Error('Patient not found');
//         }

//         // Update patient details if new information is provided
//         if (email && email !== patient.email) {
//             patient.email = email;
//         }
//         if (contactNumber && contactNumber !== patient.contactNumber) {
//             patient.contactNumber = contactNumber;
//         }
//         await patient.save();

//         // Ensure required fields exist in the patient record
//         if (!patient.age || !patient.address) {
//             res.status(400);
//             throw new Error('The patient record is missing required fields (age, address)');
//         }
//     } else {
//         // Create a new patient if no patientId is provided
//         if (!name || !age || !address || !email) {
//             res.status(400);
//             throw new Error('For new patients, name, age, address, and email are required');
//         }

//         patient = await Patient.create({
//             name,
//             email,
//             contactNumber: contactNumber || 'N/A',
//             age,
//             address,
//         });
//     }

//     // Validate Service
//     const service = await Service.findById(serviceId);
//     if (!service) {
//         res.status(404);
//         throw new Error('Service not found');
//     }

//     // Validate Doctor's Authorization for the Service
//     const isDoctorService = service.doctorPricing.some(
//         (pricing) => pricing.doctor.toString() === doctorId.toString()
//     );

//     if (!isDoctorService) {
//         res.status(403);
//         throw new Error('You are not authorized to provide this service');
//     }

//     // Check for Conflicting Sessions
//     const existingSession = await Session.findOne({
//         doctor: doctorId,
//         date: new Date(date),
//         timeSlot,
//     });

//     if (existingSession) {
//         res.status(400);
//         throw new Error('The doctor is already booked for this time slot');
//     }

//     // Validate the session date is not in the past
//     const currentDate = new Date();
//     const sessionDate = new Date(date);
//     if (sessionDate < currentDate) {
//         res.status(400);
//         throw new Error('Cannot create a session for a past date');
//     }

//     // Create the Session
//     const session = await Session.create({
//         patient: patient._id,
//         doctor: doctorId,
//         service: serviceId,
//         date: sessionDate,
//         timeSlot,
//     });

//     // Send App Notification to the Patient
//     const message = `Congratulations! Your session with Dr. ${req.user.name} is confirmed for ${sessionDate.toLocaleDateString()} at ${timeSlot}.`;
//     await addAppNotification(patient._id, message);

//     // Send Email Notification to the Patient
//     if (patient.email) {
//         try {
//             await sendEmail({
//                 to: patient.email,
//                 subject: 'Session Confirmation',
//                 text: message,
//             });
//         } catch (error) {
//             console.error('Failed to send email:', error.message);
//         }
//     }

//     // Respond with Success
//     res.status(201).json({
//         message: 'Session created successfully and notifications sent',
//         session,
//     });
// });

const createSessionUnderDoctor = asyncHandler(async (req, res) => {
    const { patientId, serviceId, date, timeSlot, name, age, address, email, contactNumber } = req.body;

    // Ensure required fields for session are provided
    if (!serviceId || !date || !timeSlot) {
        res.status(400);
        throw new Error('All fields (serviceId, date, timeSlot) are required');
    }

    const doctorId = req.user._id; // Logged-in doctor's ID
    let patient;

    // Validate or Update Patient
    if (patientId) {
        // Fetch the existing patient
        patient = await Patient.findById(patientId);
        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        // Update patient details if new information is provided
        if (email && email !== patient.email) {
            patient.email = email;
        }
        if (contactNumber && contactNumber !== patient.contactNumber) {
            patient.contactNumber = contactNumber;
        }
        await patient.save();

        // Ensure required fields exist in the patient record
        if (!patient.age || !patient.address) {
            res.status(400);
            throw new Error('The patient record is missing required fields (age, address)');
        }
    } else {
        // Create a new patient if no patientId is provided
        if (!name || !age || !address || !email) {
            res.status(400);
            throw new Error('For new patients, name, age, address, and email are required');
        }

        patient = await Patient.create({
            name,
            email,
            contactNumber: contactNumber || 'N/A',
            age,
            address,
        });
    }

    // Validate Service
    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    // Log the doctorPricing array for debugging
    console.log("Doctor Pricing Array: ", service.doctorPricing);

    // Validate Doctor's Authorization for the Service
    const isDoctorService = service.doctorPricing.some(
        (pricing) => pricing.doctor.toString() === doctorId.toString()
    );

    if (!isDoctorService) {
        console.log("Authorization Failed: Doctor not linked to the service.");
        res.status(403);
        throw new Error('You are not authorized to provide this service');
    }

    // Check for Conflicting Sessions
    const existingSession = await Session.findOne({
        doctor: doctorId,
        date: new Date(date),
        timeSlot,
    });

    if (existingSession) {
        res.status(400);
        throw new Error('The doctor is already booked for this time slot');
    }

    // Validate the session date is not in the past
    const currentDate = new Date();
    const sessionDate = new Date(date);
    if (sessionDate < currentDate) {
        res.status(400);
        throw new Error('Cannot create a session for a past date');
    }

    // Create the Session
    const session = await Session.create({
        patient: patient._id,
        doctor: doctorId,
        service: serviceId,
        date: sessionDate,
        timeSlot,
    });

    // Send App Notification to the Patient
    const message = `Congratulations! Your session with Dr. ${req.user.name} is confirmed for ${sessionDate.toLocaleDateString()} at ${timeSlot}.`;
    await addAppNotification(patient._id, message);

    // Send Email Notification to the Patient
    if (patient.email) {
        try {
            await sendEmail({
                to: patient.email,
                subject: 'Session Confirmation',
                text: message,
            });
        } catch (error) {
            console.error('Failed to send email:', error.message);
        }
    }

    // Respond with Success
    res.status(201).json({
        message: 'Session created successfully and notifications sent',
        session,
    });
});



// View Patient Profile
const viewUserProfile = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    // Validate patient ID
    if (!patientId) {
        res.status(400);
        throw new Error('Patient ID is required');
    }

    // Find the patient by ID
    const patient = await Patient.findById(patientId).select('-email -contactNumber'); // Exclude sensitive details

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    res.status(200).json(patient);
});









module.exports = { getCategories, getServices,viewUpcomingSessions,viewPatientProfile,enrollPricing ,updateAvailability ,createSessionUnderDoctor,viewUserProfile};


