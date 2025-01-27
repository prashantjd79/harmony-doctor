const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Patient = require('../models/patientModel');
const { sendEmail } = require('../utils/email');
const generateOTP = require('../utils/generateOTP');
const jwt = require('jsonwebtoken');
const Service = require('../models/serviceModel');
const Session = require('../models/sessionModel');
const Doctor = require('../models/doctorModel');




// Book a Session
const bookSession = asyncHandler(async (req, res) => {
    const { serviceId, doctorId, date, timeSlot } = req.body;
    const patientId = req.user._id; // Assumes patient is authenticated

    // Validate required fields
    if (!serviceId || !doctorId || !date || !timeSlot) {
        res.status(400);
        throw new Error('All fields (serviceId, doctorId, date, timeSlot) are required');
    }

    // Ensure the doctor offers this service
    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    const isDoctorService = service.doctorPricing.some(
        (pricing) => pricing.doctor.toString() === doctorId
    );
    if (!isDoctorService) {
        res.status(403);
        throw new Error('This doctor does not provide the selected service');
    }

    // Check for conflicting sessions
    const existingSession = await Session.findOne({
        doctor: doctorId,
        date: new Date(date),
        timeSlot,
    });

    if (existingSession) {
        res.status(400);
        throw new Error('The doctor is already booked for this time slot');
    }

    // Create the session
    const session = await Session.create({
        patient: patientId,
        doctor: doctorId,
        service: serviceId,
        date: new Date(date),
        timeSlot,
    });

    res.status(201).json({
        message: 'Session booked successfully',
        session,
    });
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


// Get Available Time Slots
const getAvailableSlots = asyncHandler(async (req, res) => {
    const { doctorId, serviceId, date } = req.body;

    // Validate inputs
    if (!doctorId || !serviceId || !date) {
        res.status(400);
        throw new Error('Doctor ID, Service ID, and Date are required');
    }

    // Fetch the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    // Define time slots (you can customize these)
    const timeSlots = [
        "09:00 AM - 09:30 AM",
        "10:00 AM - 10:30 AM",
        "11:00 AM - 11:30 AM",
        "02:00 PM - 02:30 PM",
        "03:00 PM - 03:30 PM",
        "04:00 PM - 04:30 PM",
    ];

    // Find booked slots for the given doctor and date
    const bookedSessions = await Session.find({
        doctor: doctorId,
        date: new Date(date),
    }).select('timeSlot');

    const bookedTimeSlots = bookedSessions.map((session) => session.timeSlot);

    // Filter out booked time slots
    const availableTimeSlots = timeSlots.filter(
        (slot) => !bookedTimeSlots.includes(slot)
    );

    res.status(200).json({
        availableTimeSlots,
    });
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





module.exports = { signupPatient, verifyEmail, loginPatient,viewServices , bookSession ,addJournalEntry, viewJournals ,deleteJournalEntry,getAvailableSlots,payForSession,
    viewPaymentHistory,uploadMedicalHistory,getAllDoctors,getDoctorById};

