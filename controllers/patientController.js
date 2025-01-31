const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Patient = require('../models/patientModel');
const generateOTP = require('../utils/generateOTP');
const jwt = require('jsonwebtoken');
const Service = require('../models/serviceModel');
const Session = require('../models/sessionModel');
const Doctor = require('../models/doctorModel');
const sendEmail = require("../utils/email"); // Import sendEmail utility function




// Book a Session
// const bookSession = asyncHandler(async (req, res) => {
//     const { serviceId, doctorId, date, timeSlot } = req.body;
//     const patientId = req.user._id; // Assumes patient is authenticated

//     // Validate required fields
//     if (!serviceId || !doctorId || !date || !timeSlot) {
//         res.status(400);
//         throw new Error('All fields (serviceId, doctorId, date, timeSlot) are required');
//     }

//     // Ensure the doctor offers this service
//     const service = await Service.findById(serviceId);
//     if (!service) {
//         res.status(404);
//         throw new Error('Service not found');
//     }

//     const isDoctorService = service.doctorPricing.some(
//         (pricing) => pricing.doctor.toString() === doctorId
//     );
//     if (!isDoctorService) {
//         res.status(403);
//         throw new Error('This doctor does not provide the selected service');
//     }

//     // Check for conflicting sessions
//     const existingSession = await Session.findOne({
//         doctor: doctorId,
//         date: new Date(date),
//         timeSlot,
//     });

//     if (existingSession) {
//         res.status(400);
//         throw new Error('The doctor is already booked for this time slot');
//     }

//     // Create the session
//     const session = await Session.create({
//         patient: patientId,
//         doctor: doctorId,
//         service: serviceId,
//         date: new Date(date),
//         timeSlot,
//     });

//     res.status(201).json({
//         message: 'Session booked successfully',
//         session,
//     });
// });

require("dotenv").config(); // Load environment variables
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");


const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const TOKEN_EXPIRATION_TIME = process.env.AGORA_TOKEN_EXPIRATION || 3600; // Default 1 hour


const nodemailer = require("nodemailer");

// Configure Nodemailer Transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Add in .env
        pass: process.env.EMAIL_PASS, // Add in .env
    },
});
const moment = require('moment'); // Import moment.js for time parsing


const generateAgoraToken = (channelName, userId) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + TOKEN_EXPIRATION_TIME;

    return RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        userId,
        RtcRole.PUBLISHER,
        privilegeExpireTime
    );
};





const bookSession = asyncHandler(async (req, res) => {
    try {
        console.log("Received Request Body:", req.body);

        const { serviceId, doctorId, date, timeSlot, email, paymentAmount } = req.body;
        const patientId = req.user?._id;

        if (!serviceId || !doctorId || !date || !timeSlot || !email || !paymentAmount) {
            return res.status(400).json({ error: "All fields (serviceId, doctorId, date, timeSlot, email, paymentAmount) are required" });
        }

        if (!patientId) {
            return res.status(401).json({ error: "Patient authentication failed" });
        }

        // 🔹 Fetch the doctor's availability
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        // 🔹 Ensure date matches doctor's availability
        const doctorAvailability = doctor.availability.find(avail =>
            moment(avail.date).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD")
        );

        if (!doctorAvailability) {
            return res.status(400).json({ error: "Doctor is not available on this date." });
        }

        // 🔹 Convert selected time slot into start and end timestamps
        const [startTime, endTime] = timeSlot.split(" - ").map(t => moment(t, "hh:mm A"));

        if (!startTime.isValid() || !endTime.isValid()) {
            return res.status(400).json({ error: "Invalid time slot format. Use '2 PM - 3 PM' format." });
        }

        // 🔥 **Strict Validation: Ensure Only Hourly Slots**
        if (startTime.minute() !== 0 || endTime.minute() !== 0) {
            return res.status(400).json({ error: "Invalid time slot. You can only book full hours (e.g., '2 PM - 3 PM')." });
        }

        // 🔹 Ensure time slot is within the doctor's available hours
        const isAvailableSlot = doctorAvailability.slots.some(slot => {
            const availableStart = moment(slot.start, "hh A");
            const availableEnd = moment(slot.end, "hh A");
            return startTime.isSameOrAfter(availableStart) && endTime.isSameOrBefore(availableEnd);
        });

        if (!isAvailableSlot) {
            return res.status(400).json({ error: "Selected time slot is outside the doctor's available hours." });
        }

        // 🔥 **Check for already booked hour slots**
        const overlappingSession = await Session.findOne({
            doctor: doctorId,
            date: new Date(date),
            timeSlot: timeSlot, // Exact hour match only
        });

        if (overlappingSession) {
            return res.status(400).json({ error: "The selected time slot is already booked. Choose a different hour." });
        }

        // 🔹 Validate payment amount
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        const doctorServicePricing = service.doctorPricing.find(pricing => pricing.doctor.toString() === doctorId);
        if (!doctorServicePricing) {
            return res.status(403).json({ error: "This doctor does not provide the selected service" });
        }

        if (paymentAmount !== doctorServicePricing.fee) {
            return res.status(400).json({ error: `Incorrect payment amount. The required fee is ${doctorServicePricing.fee}` });
        }

        // ✅ Generate Agora Video Call Credentials
        const agoraChannel = `session_${doctorId}_${patientId}_${Date.now()}`;
        const doctorToken = generateAgoraToken(agoraChannel, doctorId);
        const patientToken = generateAgoraToken(agoraChannel, patientId);

        // ✅ Create the session in MongoDB
        const session = await Session.create({
            patient: patientId,
            doctor: doctorId,
            service: serviceId,
            date: new Date(date),
            timeSlot,
            videoCall: {
                channelName: agoraChannel,
                doctorToken,
                patientToken,
                callStatus: "Not Started",
            },
            paymentDetails: { status: "Paid" },
        });

        console.log("Session Created Successfully:", session);

        // ✅ Send Confirmation Email to the Patient
        await sendEmail({
            to: email,
            subject: "Session Booking Confirmation",
            text: `Your session with Doctor ID: ${doctorId} is booked for ${date} at ${timeSlot}. Payment of ${paymentAmount} received successfully.`,
        });

        res.status(201).json({
            message: "Session booked successfully. Email sent to patient.",
            session,
        });
    } catch (error) {
        console.error("Error in bookSession:", error);
        res.status(500).json({ error: error.message });
    }
});


















const mongoose = require("mongoose");


const getPatientSessionHistory = asyncHandler(async (req, res) => {
    const patientId = req.user._id; // Get logged-in patient ID

    console.log("Fetching session history for Patient ID:", patientId);

    try {
        // Convert `patientId` to ObjectId format
        const patientObjectId = new mongoose.Types.ObjectId(patientId);

        // Fetch session history from the database
        const sessions = await Session.find({ patient: patientObjectId })
            .populate("doctor", "name email specialization") // Populate doctor details
            .populate("service", "name price") // Populate service details
            .sort({ date: -1 });

        console.log("Raw Session Data from MongoDB:", sessions);

        if (!sessions || sessions.length === 0) {
            console.log("❌ No sessions found for the patient.");
            return res.status(200).json({
                message: "No sessions found for this patient.",
                sessions: [],
            });
        }

        // Transforming the response
        const formattedSessions = sessions.map(session => ({
            _id: session._id,
            doctor: session.doctor,
            service: session.service.name,
            servicePrice: session.service.price,
            date: session.date,
            timeSlot: session.timeSlot,
            status: session.status,
            paymentStatus: session.paymentDetails ? session.paymentDetails.status : "Unknown",
            videoCall: session.videoCall,
            createdAt: session.createdAt
        }));

        console.log("✅ Processed Sessions Data:", formattedSessions);

        res.status(200).json({
            message: "Patient session history retrieved successfully",
            sessions: formattedSessions,
        });
    } catch (error) {
        console.error("❌ Error in getPatientSessionHistory:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
















// View Available Services
const viewServices = asyncHandler(async (req, res) => {
    const services = await Service.find().populate('doctorPricing.doctor', 'name specialization');
    res.status(200).json({ services });
});

const signupPatient = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        contactNumber,
        birthday,
        gender,
        isTakingConsultation,
        age,
        address,
        password,
    } = req.body;

    // Validate required fields
    if (!name || !email || !contactNumber || !birthday || !gender || !age || !address || !password) {
        res.status(400);
        throw new Error('All fields (name, email, contactNumber, birthday, gender, age, address, password) are required');
    }

    // Check if the patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
        res.status(400);
        throw new Error('Patient already exists with this email');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Create new patient
    const newPatient = await Patient.create({
        name,
        email,
        contactNumber,
        birthday,
        gender,
        isTakingConsultation: isTakingConsultation === 'Yes',
        isEmailVerified: false,
        otp,
        password: hashedPassword, // Save hashed password
        age,
        address,
    });

    // Send OTP via email
    const message = `Your OTP for email verification is: ${otp}`;
    try {
        await sendEmail({
            to: email,
            subject: 'Email Verification OTP',
            text: message,
        });
    } catch (error) {
        console.error('Failed to send OTP:', error.message);
    }

    res.status(201).json({
        message: 'Patient created successfully. OTP sent to email for verification.',
        patientId: newPatient._id,
    });
});


// Patient Email Verification
const verifyEmail = asyncHandler(async (req, res) => {
    const { patientId, otp } = req.body;

    if (!patientId || !otp) {
        res.status(400);
        throw new Error('Patient ID and OTP are required');
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    if (patient.otp !== otp) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    patient.isEmailVerified = true;
    patient.otp = null;
    await patient.save();

    res.status(200).json({ message: 'Email verified successfully' });
});

// Patient Login
const loginPatient = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Email and Password are required');
    }

    const patient = await Patient.findOne({ email });
    if (!patient) {
        res.status(404);
        throw new Error('Invalid email or password');
    }

    if (!patient.isEmailVerified) {
        res.status(401);
        throw new Error('Email not verified. Please verify your email before logging in.');
    }

    const isPasswordMatch = await bcrypt.compare(password, patient.password);
    if (!isPasswordMatch) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({ message: 'Login successful', token });
});



// Add a Journal Entry
const addJournalEntry = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const patientId = req.user._id;

    // Validate inputs
    if (!title || !description) {
        res.status(400);
        throw new Error('Title and description are required');
    }

    // Find the patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    // Add journal entry
    const journalEntry = {
        title,
        description,
        date: new Date(),
    };

    if (!patient.journals) patient.journals = []; // Initialize if undefined
    patient.journals.push(journalEntry);
    await patient.save();

    res.status(201).json({
        message: 'Journal entry added successfully',
        journalEntry,
    });
});




// View All Journal Entries
const viewJournals = asyncHandler(async (req, res) => {
    const patientId = req.user._id;

    // Find the patient
    const patient = await Patient.findById(patientId).select('journals');
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    res.status(200).json({
        journals: patient.journals,
    });
});

// Delete a Journal Entry
const deleteJournalEntry = asyncHandler(async (req, res) => {
    const { journalId } = req.params;
    const patientId = req.user._id;

    // Find the patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    // Find and remove the journal entry
    const journalIndex = patient.journals.findIndex(
        (journal) => journal._id.toString() === journalId
    );

    if (journalIndex === -1) {
        res.status(404);
        throw new Error('Journal entry not found');
    }

    patient.journals.splice(journalIndex, 1); // Remove the journal entry
    await patient.save();

    res.status(200).json({ message: 'Journal entry deleted successfully' });
});

const getAvailableSlots = asyncHandler(async (req, res) => {
    try {
        console.log("Received Request Body:", req.body);

        const { doctorId, date } = req.body;

        if (!doctorId || !date) {
            console.log("❌ Missing doctorId or date in request.");
            return res.status(400).json({ error: "Doctor ID and date are required." });
        }

        // 🔹 Fetch doctor availability
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            console.log("❌ Doctor not found:", doctorId);
            return res.status(404).json({ error: "Doctor not found." });
        }

        console.log("✅ Doctor found:", doctor.name);

        const doctorAvailability = doctor.availability.find(avail =>
            moment(avail.date).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD")
        );

        if (!doctorAvailability) {
            console.log("❌ Doctor is not available on this date:", date);
            return res.status(400).json({ error: "Doctor is not available on this date." });
        }

        console.log("✅ Doctor availability on", date, ":", doctorAvailability);

        // 🔹 Fetch booked sessions for the selected date
        const bookedSessions = await Session.find({ doctor: doctorId, date: new Date(date) });

        console.log("📌 Booked sessions found:", bookedSessions.length, "sessions");
        console.log("📌 Booked session details:", bookedSessions);

        // 🔹 Extract booked time slots
        const bookedTimes = bookedSessions.map(session => session.timeSlot.split(" - ")[0]); // Get start hour (e.g., "2 PM")
        console.log("🚫 Booked Times:", bookedTimes);

        let availableSlots = [];
        doctorAvailability.slots.forEach(slot => {
            const startHour = slot.start.split(":")[0] + " PM"; // Convert to match booked format (e.g., "2 PM")
            const endHour = slot.end.split(":")[0] + " PM";

            let start = moment(startHour, "h A");
            let end = moment(endHour, "h A");

            while (start.isBefore(end)) {
                let slotStart = start.format("h A");
                let slotEnd = start.add(1, 'hour').format("h A");

                if (!bookedTimes.includes(slotStart)) {
                    availableSlots.push({ start: slotStart, end: slotEnd, status: "Available" });
                }
            }
        });

        console.log("✅ Final Updated Available Slots:", availableSlots);

        res.status(200).json({
            message: "Available slots retrieved successfully.",
            availableSlots,
        });
    } catch (error) {
        console.error("❌ Error in getAvailableSlots:", error);
        res.status(500).json({ error: error.message });
    }
});











const payForSession = asyncHandler(async (req, res) => {
    const { sessionId, paymentMethod } = req.body;

    // Validate inputs
    if (!sessionId || !paymentMethod) {
        res.status(400);
        throw new Error('Session ID and payment method are required');
    }

    // Fetch the session and populate the service details
    const session = await Session.findById(sessionId).populate('service', 'name price');
    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    // Ensure the session belongs to the logged-in patient
    if (session.patient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to pay for this session');
    }

    // Check if the session is already paid
    if (session.status === 'Paid') {
        res.status(400);
        throw new Error('This session has already been paid for');
    }

    // Log payment details for debugging
    console.log(`Processing payment for Session ID: ${sessionId}`);
    console.log(`Payment Method: ${paymentMethod}`);
    console.log(`Amount: ${session.service.price}`);

    // Mock payment processing (In a real-world scenario, integrate a payment gateway here)
    // If payment is successful, update the session status to 'Paid'
    session.status = 'Paid';
    await session.save();

    res.status(200).json({
        message: 'Payment successful',
        session,
    });
});

// View Payment History
const viewPaymentHistory = asyncHandler(async (req, res) => {
    const patientId = req.user._id;

    // Fetch all paid sessions for the patient
    const paidSessions = await Session.find({ patient: patientId, status: 'Paid' })
        .populate('service', 'name price')
        .populate('doctor', 'name specialization');

    res.status(200).json({
        payments: paidSessions.map((session) => ({
            sessionId: session._id,
            serviceName: session.service.name,
            doctorName: session.doctor.name,
            price: session.service.price,
            date: session.date,
            timeSlot: session.timeSlot,
        })),
    });
});
const uploadMedicalHistory = asyncHandler(async (req, res) => {
    console.log('Uploaded File:', req.file); // Logs the uploaded file
    console.log('Body Data:', req.body); // Logs all fields in the body

    // Check if the file and description are provided
    const description = req.body.description?.trim(); // Safely access and trim the description
    if (!req.file || !description) {
        res.status(400);
        throw new Error('File and description are required');
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const patientId = req.user._id;

    // Find the patient in the database
    const patient = await Patient.findById(patientId);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    // Add medical history entry
    const medicalHistoryEntry = {
        document: fileUrl,
        description,
        date: new Date(),
    };

    // Save the medical history
    if (!patient.medicalHistory) patient.medicalHistory = [];
    patient.medicalHistory.push(medicalHistoryEntry);
    await patient.save();

    res.status(201).json({
        message: 'Medical history uploaded successfully',
        medicalHistory: medicalHistoryEntry,
    });
});



// Get All Doctors
const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({ isApproved: true }).select(
        'name specialization qualifications experience profilePicture'
    );

    res.status(200).json({
        message: 'Doctors fetched successfully',
        doctors,
    });
});

const getDoctorById = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;

    console.log('Doctor ID received:', doctorId); // Log the received ID

    // Try to find the doctor by ID
    const doctor = await Doctor.findById(doctorId).select(
        'name specialization qualifications experience profilePicture isApproved'
    );

    if (!doctor) {
        console.error('Doctor not found for ID:', doctorId); // Log if the doctor is not found
        res.status(404);
        throw new Error('Doctor not found');
    }

    if (!doctor.isApproved) {
        console.error('Doctor found but not approved:', doctorId); // Log if the doctor is not approved
        res.status(403);
        throw new Error('Doctor is not approved');
    }

    res.status(200).json({
        message: 'Doctor fetched successfully',
        doctor,
    });
});



// 🟢 Start Video Call (Generates Agora Tokens for Patient & Doctor)
const startVideoCall = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const patientId = req.user._id;

    // Find session by ID
    const session = await Session.findById(sessionId);
    if (!session) {
        res.status(404);
        throw new Error("Session not found");
    }

    // Check if the logged-in patient is the session owner
    if (session.patient.toString() !== patientId.toString()) {
        res.status(403);
        throw new Error("Access denied. You are not authorized to start this call.");
    }

    // Generate Agora Channel & Tokens
    const channelName = `session_${session.doctor}_${session.patient}_${Date.now()}`;
    const doctorToken = `fakeToken_${session.doctor}_${Date.now()}`;
    const patientToken = `fakeToken_${session.patient}_${Date.now()}`;

    // Update session with video call details
    session.videoCall = {
        channelName,
        doctorToken,
        patientToken,
        callStatus: "In Progress",
    };

    await session.save();

    res.status(200).json({
        message: "Call started successfully",
        session,
    });
});

// 🔴 End Video Call (Marks session as Completed)
const endVideoCall = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const patientId = req.user._id;

    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
        res.status(404);
        throw new Error("Session not found");
    }

    // Check authorization
    if (session.patient.toString() !== patientId.toString()) {
        res.status(403);
        throw new Error("Access denied. You are not authorized to end this call.");
    }

    // Mark call as completed
    session.videoCall.callStatus = "Completed";
    session.status = "Completed";
    await session.save();

    res.status(200).json({
        message: "Call ended successfully",
        session,
    });
});






module.exports = { signupPatient, verifyEmail, loginPatient,viewServices , bookSession ,addJournalEntry, viewJournals ,deleteJournalEntry,getAvailableSlots,payForSession,
    viewPaymentHistory,uploadMedicalHistory,getAllDoctors,getDoctorById,startVideoCall,endVideoCall,getPatientSessionHistory};

