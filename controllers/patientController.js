const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Patient = require('../models/patientModel');
const generateOTP = require('../utils/generateOTP');
const jwt = require('jsonwebtoken');
const Service = require('../models/serviceModel');
const Session = require('../models/sessionModel');
const Doctor = require('../models/doctorModel');
const sendEmail = require("../utils/email"); // Import sendEmail utility function
const Category = require("../models/categoryModel");
const MoodContinuum = require("../models/moodContinuumModel");
const Blog = require('../models/blogModels');
const Article = require('../models/articleModel');
const YoutubeBlog = require('../models/youtubeBlogModel.js');
const PromoCode = require("../models/promoCodeModel");








// ✅ Apply Promo Code (Fix Mental Health Check)
const applyPromoCode = asyncHandler(async (req, res) => {
    const { code, patientId, transactionCount } = req.body;

    try {
        const promoCode = await PromoCode.findOne({ code });
        if (!promoCode) {
            res.status(404);
            throw new Error("Invalid Promo Code");
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            res.status(404);
            throw new Error("Patient not found");
        }

        // ✅ Fetch patient's latest mental health score from `moodcontinuums`
        const latestMood = await MoodContinuum.findOne({ patient: patientId })
            .sort({ createdAt: -1 }) // Get the most recent mood entry
            .select("moodScore"); // Only select moodScore

        const mentalHealthScore = latestMood ? latestMood.moodScore : null;

        // ✅ Condition 1: Check if promo code is for a specific transaction
        if (promoCode.applicableTransactions !== null) {
            if (transactionCount !== promoCode.applicableTransactions) {
                res.status(400);
                throw new Error(`This promo code is only valid for transaction #${promoCode.applicableTransactions}`);
            }
        }

        // ✅ Condition 2: Check for mental health condition
        if (promoCode.specialForMentalHealth) {
            if (!mentalHealthScore || mentalHealthScore <= 2.0) {
                res.status(400);
                throw new Error("This promo code is only for patients with mental health score > 2.0");
            }
        }

        // ✅ Check if patient already used this promo code
        const alreadyUsed = patient.usedPromoCodes.some(p => p.code === code);
        if (alreadyUsed) {
            res.status(400);
            throw new Error("You have already used this promo code.");
        }

        // ✅ Store the applied promo code in the patient's record
        patient.usedPromoCodes.push({
            code: promoCode.code,
            discountPercentage: promoCode.discountPercentage,
            appliedAt: new Date()
        });

        await patient.save(); // ✅ Save changes

        res.status(200).json({
            success: true,
            message: "Promo Code applied successfully",
            discount: promoCode.discountPercentage,
            appliedPromoCodes: patient.usedPromoCodes
        });
    } catch (error) {
        res.status(500).json({ message: "Error applying promo code", error: error.message });
    }
});



















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
const { RtcTokenBuilder, RtcRole } = require("agora-token");


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
	const appId = process.env.AGORA_APP_ID;
	const appCertificate = process.env.AGORA_APP_CERTIFICATE;
	const role = RtcRole.PUBLISHER;
	const tokenExpirationInSecond = 3600;
	const privilegeExpirationInSecond = 3600;
	const tokenWithUserAccount = RtcTokenBuilder.buildTokenWithUid(
		appId,
		appCertificate,
		channelName,
		0,
		role,
		tokenExpirationInSecond,
		privilegeExpirationInSecond
	);

	return tokenWithUserAccount;
};





// const bookSession = asyncHandler(async (req, res) => {
//     try {
//         console.log("Received Request Body:", req.body);

//         const { serviceId, doctorId, date, timeSlot, email, paymentAmount } = req.body;
//         const patientId = req.user?._id;

//         if (!serviceId || !doctorId || !date || !timeSlot || !email || !paymentAmount) {
//             return res.status(400).json({ error: "All fields (serviceId, doctorId, date, timeSlot, email, paymentAmount) are required" });
//         }

//         if (!patientId) {
//             return res.status(401).json({ error: "Patient authentication failed" });
//         }

//         // 🔹 Fetch the doctor's availability
//         const doctor = await Doctor.findById(doctorId);
//         if (!doctor) {
//             return res.status(404).json({ error: "Doctor not found" });
//         }

//         // 🔹 Ensure date matches doctor's availability
//         const doctorAvailability = doctor.availability.find(avail =>
//             moment(avail.date).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD")
//         );

//         if (!doctorAvailability) {
//             return res.status(400).json({ error: "Doctor is not available on this date." });
//         }

//         // 🔹 Convert selected time slot into start and end timestamps
//         const [startTime, endTime] = timeSlot.split(" - ").map(t => moment(t, "hh:mm A"));

//         if (!startTime.isValid() || !endTime.isValid()) {
//             return res.status(400).json({ error: "Invalid time slot format. Use '2 PM - 3 PM' format." });
//         }

//         // 🔥 **Strict Validation: Ensure Only Hourly Slots**
//         if (startTime.minute() !== 0 || endTime.minute() !== 0) {
//             return res.status(400).json({ error: "Invalid time slot. You can only book full hours (e.g., '2 PM - 3 PM')." });
//         }

//         // 🔹 Ensure time slot is within the doctor's available hours
//         const isAvailableSlot = doctorAvailability.slots.some(slot => {
//             const availableStart = moment(slot.start, "hh A");
//             const availableEnd = moment(slot.end, "hh A");
//             return startTime.isSameOrAfter(availableStart) && endTime.isSameOrBefore(availableEnd);
//         });

//         if (!isAvailableSlot) {
//             return res.status(400).json({ error: "Selected time slot is outside the doctor's available hours." });
//         }

//         // 🔥 **Check for already booked hour slots**
//         const overlappingSession = await Session.findOne({
//             doctor: doctorId,
//             date: new Date(date),
//             timeSlot: timeSlot, // Exact hour match only
//         });

//         if (overlappingSession) {
//             return res.status(400).json({ error: "The selected time slot is already booked. Choose a different hour." });
//         }

//         // 🔹 Validate payment amount
//         const service = await Service.findById(serviceId);
//         if (!service) {
//             return res.status(404).json({ error: "Service not found" });
//         }

//         const doctorServicePricing = service.doctorPricing.find(pricing => pricing.doctor.toString() === doctorId);
//         if (!doctorServicePricing) {
//             return res.status(403).json({ error: "This doctor does not provide the selected service" });
//         }

//         if (paymentAmount !== doctorServicePricing.fee) {
//             return res.status(400).json({ error: `Incorrect payment amount. The required fee is ${doctorServicePricing.fee}` });
//         }

//         // ✅ Generate Agora Video Call Credentials
//         const agoraChannel = `session_${doctorId}_${patientId}_${Date.now()}`;
//         const doctorToken = generateAgoraToken(agoraChannel, doctorId);
//         const patientToken = generateAgoraToken(agoraChannel, patientId);

//         // ✅ Create the session in MongoDB
//         const session = await Session.create({
//             patient: patientId,
//             doctor: doctorId,
//             service: serviceId,
//             date: new Date(date),
//             timeSlot,
//             videoCall: {
//                 channelName: agoraChannel,
//                 doctorToken,
//                 patientToken,
//                 callStatus: "Not Started",
//             },
//             paymentDetails: { status: "Paid" },
//         });

//         console.log("Session Created Successfully:", session);

//         // ✅ Send Confirmation Email to the Patient
//         await sendEmail({
//             to: email,
//             subject: "Session Booking Confirmation",
//             text: `Your session with Doctor ID: ${doctorId} is booked for ${date} at ${timeSlot}. Payment of ${paymentAmount} received successfully.`,
//         });

//         res.status(201).json({
//             message: "Session booked successfully. Email sent to patient.",
//             session,
//         });
//     } catch (error) {
//         console.error("Error in bookSession:", error);
//         res.status(500).json({ error: error.message });
//     }
// });


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
        const [startTime, endTime] = timeSlot.split(" - ").map(t => moment(t, "h A"));

        if (!startTime.isValid() || !endTime.isValid()) {
            return res.status(400).json({ error: "Invalid time slot format. Use '2 PM - 3 PM' format." });
        }

        // 🔥 **Strict Validation: Ensure Only One-Hour Slots**
        const duration = moment.duration(endTime.diff(startTime));
        if (duration.asHours() !== 1) {
            return res.status(400).json({ error: "You can only book a session for exactly one hour." });
        }

        // 🔹 Ensure time slot is within the doctor's available hours
        const isAvailableSlot = doctorAvailability.slots.some(slot => {
            const availableStart = moment(slot.start, "h A");
            const availableEnd = moment(slot.end, "h A");
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
        const agoraChannel = `${doctorId}${patientId}${Date.now()}`;
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
// const loginPatient = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         res.status(400);
//         throw new Error('Email and Password are required');
//     }

//     const patient = await Patient.findOne({ email });
//     if (!patient) {
//         res.status(404);
//         throw new Error('Invalid email or password');
//     }

//     if (!patient.isEmailVerified) {
//         res.status(401);
//         throw new Error('Email not verified. Please verify your email before logging in.');
//     }

//     const isPasswordMatch = await bcrypt.compare(password, patient.password);
//     if (!isPasswordMatch) {
//         res.status(401);
//         throw new Error('Invalid email or password');
//     }

//     const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

//     res.status(200).json({ message: 'Login successful', token });
// });



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

// const getAvailableSlots = asyncHandler(async (req, res) => {
//     try {
//         console.log("Received Request Body:", req.body);

//         const { doctorId, date } = req.body;

//         if (!doctorId || !date) {
//             console.log("❌ Missing doctorId or date in request.");
//             return res.status(400).json({ error: "Doctor ID and date are required." });
//         }

//         // 🔹 Fetch doctor availability
//         const doctor = await Doctor.findById(doctorId);
//         if (!doctor) {
//             console.log("❌ Doctor not found:", doctorId);
//             return res.status(404).json({ error: "Doctor not found." });
//         }

//         console.log("✅ Doctor found:", doctor.name);

//         const doctorAvailability = doctor.availability.find(avail =>
//             moment(avail.date).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD")
//         );

//         if (!doctorAvailability) {
//             console.log("❌ Doctor is not available on this date:", date);
//             return res.status(400).json({ error: "Doctor is not available on this date." });
//         }

//         console.log("✅ Doctor availability on", date, ":", doctorAvailability);

//         // 🔹 Fetch booked sessions for the selected date
//         const bookedSessions = await Session.find({ doctor: doctorId, date: new Date(date) });

//         console.log("📌 Booked sessions found:", bookedSessions.length, "sessions");
//         console.log("📌 Booked session details:", bookedSessions);

//         // 🔹 Extract booked time slots
//         const bookedTimes = bookedSessions.map(session => session.timeSlot.split(" - ")[0]); // Get start hour (e.g., "2 PM")
//         console.log("🚫 Booked Times:", bookedTimes);

//         let availableSlots = [];
//         doctorAvailability.slots.forEach(slot => {
//             const startHour = slot.start.split(":")[0] + " PM"; // Convert to match booked format (e.g., "2 PM")
//             const endHour = slot.end.split(":")[0] + " PM";

//             let start = moment(startHour, "h A");
//             let end = moment(endHour, "h A");

//             while (start.isBefore(end)) {
//                 let slotStart = start.format("h A");
//                 let slotEnd = start.add(1, 'hour').format("h A");

//                 if (!bookedTimes.includes(slotStart)) {
//                     availableSlots.push({ start: slotStart, end: slotEnd, status: "Available" });
//                 }
//             }
//         });

//         console.log("✅ Final Updated Available Slots:", availableSlots);

//         res.status(200).json({
//             message: "Available slots retrieved successfully.",
//             availableSlots,
//         });
//     } catch (error) {
//         console.error("❌ Error in getAvailableSlots:", error);
//         res.status(500).json({ error: error.message });
//     }
// });




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
        const bookedTimes = bookedSessions.map(session => 
            moment(session.timeSlot.split(" - ")[0], ["h A", "hh A"]).format("h A")
        ); // Normalize format to avoid mismatch
        console.log("🚫 Booked Times:", bookedTimes);

        let availableSlots = [];
        
        doctorAvailability.slots.forEach(slot => {
            let start = moment(slot.start, ["h A", "hh A"]); // Accepts both single & double-digit
            let end = moment(slot.end, ["h A", "hh A"]);

            while (start.isBefore(end)) {
                let slotStart = start.format("h A");
                let slotEnd = start.add(1, 'hour').format("h A");

                // Ensure slot is correctly formatted and not already booked
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





// 📌 Get Upcoming Sessions for a Patient
const getUpcomingSessions = asyncHandler(async (req, res) => {
    const patientId = req.user.id;  // Assuming `req.user.id` is set after authentication

    // ✅ Find upcoming sessions for the logged-in patient
    const upcomingSessions = await Session.find({
        patient: patientId,
        date: { $gte: moment().startOf('day').toDate() }, // Sessions from today onwards
        status: { $in: ["Scheduled", "Rescheduled"] } // Only active sessions
    }).populate('doctor', 'name specialization') // Populate doctor details
      .populate('service', 'name') // Populate service details
      .sort({ date: 1 }); // Sort by nearest upcoming date

    res.status(200).json({
        message: "Upcoming sessions retrieved successfully.",
        upcomingSessions
    });
});




const submitSessionReview = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { rating, comment } = req.body;
    const patientId = req.user._id; // Logged-in patient

    // Validate inputs
    if (!rating || rating < 1 || rating > 5) {
        res.status(400);
        throw new Error("Rating must be between 1 and 5");
    }

    // Find the session
    const session = await Session.findById(sessionId);
    if (!session) {
        res.status(404);
        throw new Error("Session not found");
    }

    // Ensure the session is completed
    if (session.status !== "Completed") {
        res.status(400);
        throw new Error("You can only review completed sessions");
    }

    // Ensure the `reviews` array exists
    if (!session.reviews) {
        session.reviews = [];
    }

    // Check if the patient has already submitted a review
    const existingReviewIndex = session.reviews.findIndex(
        (review) => review.patient.toString() === patientId.toString()
    );

    if (existingReviewIndex !== -1) {
        // Patient has already reviewed → Update existing review
        session.reviews[existingReviewIndex].rating = rating;
        session.reviews[existingReviewIndex].comment = comment;
        session.reviews[existingReviewIndex].createdAt = new Date();
    } else {
        // Add new review if the patient hasn't reviewed before
        session.reviews.push({
            patient: patientId,
            rating,
            comment,
            createdAt: new Date(),
        });
    }

    // Save updated session to database
    await session.save();

    res.status(200).json({
        message: "Review submitted successfully",
        reviews: session.reviews,
    });
});


const getAllCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
    }
});




// ✅ Get Promo Codes for a Specific Patient
const getPatientPromoCodes = asyncHandler(async (req, res) => {
    const { patientId } = req.params; // Get patient ID from request params

    try {
        const patient = await Patient.findById(patientId);
        if (!patient) {
            res.status(404);
            throw new Error("Patient not found");
        }

        // ✅ Fetch all available promo codes
        let promoCodes = await PromoCode.find({
            $or: [
                { specialForMentalHealth: false }, // ✅ Promo codes that are available for everyone
                { specialForMentalHealth: true, applicableTransactions: null } // ✅ Only mental health-based promo codes
            ]
        }).sort({ createdAt: -1 });

        // ✅ If patient has a mental health score > 2.0, show all promos
        if (patient.mentalHealthScore && patient.mentalHealthScore > 2.0) {
            promoCodes = await PromoCode.find().sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            count: promoCodes.length,
            promoCodes
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching promo codes",
            error: error.message
        });
    }
});

const getPatientProfile = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user._id).select('-password');

    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    res.status(200).json(patient);
});
const updatePatientProfile = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user._id);

    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    patient.name = req.body.name || patient.name;
    patient.email = req.body.email || patient.email;
    patient.contactNumber = req.body.contactNumber || patient.contactNumber;
    patient.birthday = req.body.birthday || patient.birthday;
    patient.gender = req.body.gender || patient.gender;
    patient.age = req.body.age || patient.age;
    patient.address = req.body.address || patient.address;

    const updatedPatient = await patient.save();
    res.status(200).json(updatedPatient);
});
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    
    if (!categories.length) {
        res.status(404);
        throw new Error("No categories found");
    }

    res.status(200).json(categories);
});
const getBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ isApproved: true }).sort({ createdAt: -1 });

    if (!blogs.length) {
        res.status(404);
        throw new Error("No blogs found");
    }

    res.status(200).json(blogs);
});
const getYoutubeBlogs = asyncHandler(async (req, res) => {
    const youtubeBlogs = await YoutubeBlog.find({ isApproved: true }).sort({ createdAt: -1 });

    if (!youtubeBlogs.length) {
        res.status(404);
        throw new Error("No YouTube blogs found");
    }

    res.status(200).json(youtubeBlogs);
});
const getArticles = asyncHandler(async (req, res) => {
    const articles = await Article.find({ isApproved: true }).sort({ createdAt: -1 });

    if (!articles.length) {
        res.status(404);
        throw new Error("No articles found");
    }

    res.status(200).json(articles);
});
const getTopConsultants = asyncHandler(async (req, res) => {
    const topConsultants = await Doctor.find({ isApproved: true })
        .sort({ experience: -1 }) // Sorting by highest experience
        .limit(5) // Get top 5
        .select("name specialization experience profilePicture");

    res.status(200).json(topConsultants);
});
const getCompletedMeetings = asyncHandler(async (req, res) => {
    const completedMeetings = await Session.countDocuments({
        patient: req.user._id,
        status: "Completed",
    });

    res.status(200).json({ completedMeetings });
});

const loginPatient = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });

    if (patient && (await bcrypt.compare(password, patient.password))) {
        if (!patient.isEmailVerified) {
            res.status(401);
            throw new Error("Email not verified. Please verify before logging in.");
        }
        const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};


        res.status(200).json({
            _id: patient._id,
            name: patient.name,
            email: patient.email,
            contactNumber: patient.contactNumber,
            gender: patient.gender,
            age: patient.age,
            address: patient.address,
            token: generateToken(patient._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});





module.exports = { signupPatient,getUpcomingSessions, verifyEmail, loginPatient,viewServices , bookSession ,addJournalEntry, viewJournals ,deleteJournalEntry,getAvailableSlots,payForSession,getPatientProfile,updatePatientProfile,getCategories,getBlogs,getYoutubeBlogs,getArticles,getTopConsultants,getCompletedMeetings,
    viewPaymentHistory,uploadMedicalHistory,getAllDoctors,getDoctorById,startVideoCall,endVideoCall,getPatientSessionHistory,submitSessionReview,getAllCategories,applyPromoCode,getPatientPromoCodes};

