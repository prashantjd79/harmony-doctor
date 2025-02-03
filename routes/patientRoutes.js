// const express = require('express');
// const router = express.Router();
// const { protect,patientProtect } = require('../middleware/authMiddleware');
// const { uploadMedicalHistory } = require('../controllers/patientController');
// const upload = require('../middleware/uploadMiddleware');
// const {
//     signupPatient,
//     verifyEmail,
//     loginPatient,
//     viewServices,
//     startVideoCall,endVideoCall,
//     bookSession, addJournalEntry, viewJournals, deleteJournalEntry,getAvailableSlots,
//     payForSession, viewPaymentHistory, getAllDoctors, getDoctorById,getPatientSessionHistory
// } = require('../controllers/patientController');

// router.post('/signup', signupPatient); // Signup
// router.post('/verify-email', verifyEmail); // Email Verification
// router.post('/login', loginPatient); // Login
// router.get('/services', viewServices); 
// router.post('/book-session', protect, bookSession);
// router.post('/journals', protect, addJournalEntry); // Add a journal entry
// router.get('/journals', protect, viewJournals); // View all journal entries
// router.delete('/journals/:journalId', protect, deleteJournalEntry); // Delete a journal entry
// router.get("/available-slots", getAvailableSlots); 

// router.post('/pay', protect, payForSession);
// router.post('/medical-history', protect, upload.single('file'), uploadMedicalHistory);
// // View payment history
// router.get('/payment-history', protect, viewPaymentHistory);
// router.get('/doctors', protect, getAllDoctors);

// // Get specific doctor by ID
// router.get('/doctors/:doctorId', protect, getDoctorById);
// router.post("/book-session", protect, patientProtect, bookSession);
// router.put("/video-call/start/:sessionId", protect, patientProtect, startVideoCall);

// // End Video Call (Mark session as completed)
// router.put("/video-call/end/:sessionId", protect, patientProtect, endVideoCall);
// router.get("/session-history", protect, getPatientSessionHistory);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { protect, patientProtect } = require("../middleware/authMiddleware");
const { uploadMedicalHistory } = require("../controllers/patientController");
const { submitSessionReview } = require('../controllers/patientController');
const upload = require("../middleware/uploadMiddleware");
const { submitMood, getMoodHistory  } = require('../controllers/moodController');
const { submitMoodContinuum, getMoodContinuumHistory } = require('../controllers/moodContinuumController');
const {
    signupPatient,
    verifyEmail,
    loginPatient,
    viewServices,
    startVideoCall,
    endVideoCall,
    bookSession,
    addJournalEntry,
    viewJournals,
    deleteJournalEntry,
    getAvailableSlots,
    payForSession,
    viewPaymentHistory,
    getAllDoctors,
    getDoctorById,
    getPatientSessionHistory,
    getUpcomingSessions
    
} = require("../controllers/patientController");



const { markDoctorAbsent } = require("../controllers/sessionController");
// ✅ Patient Authentication & Signup
router.put("/sessions/mark-absent", protect, markDoctorAbsent);
router.post("/signup", signupPatient);
router.post("/verify-email", verifyEmail);
router.post("/login", loginPatient);
router.put('/sessions/:sessionId/review', protect, submitSessionReview);
// ✅ Viewing Services & Doctors
router.get("/services", protect, viewServices);
router.get("/doctors", protect, getAllDoctors);
router.get("/doctors/:doctorId", protect, getDoctorById);

// ✅ Booking & Sessions
router.post("/available-slots", protect, getAvailableSlots);


router.post("/book-session", protect, patientProtect, bookSession);
router.get("/session-history", protect, getPatientSessionHistory);

// ✅ Video Call Functionality
router.put("/video-call/start/:sessionId", protect, patientProtect, startVideoCall);
router.put("/video-call/end/:sessionId", protect, patientProtect, endVideoCall);

// ✅ Journals
router.post("/journals", protect, addJournalEntry);
router.get("/journals", protect, viewJournals);
router.delete("/journals/:journalId", protect, deleteJournalEntry);

// ✅ Medical History Upload
router.post("/medical-history", protect, upload.single("file"), uploadMedicalHistory);

// ✅ Payments
router.post("/pay", protect, payForSession);
router.get("/payment-history", protect, viewPaymentHistory);

router.get('/sessions/upcoming', protect, patientProtect, getUpcomingSessions);

router.post('/mood', protect, submitMood); // Submit mood
router.get('/mood/history', protect, getMoodHistory); // View mood history

router.post('/mood/submit', protect, submitMoodContinuum);

// 📌 Get Mood Continuum History
router.get('/mood/continuum-history', protect, getMoodContinuumHistory);

module.exports = router;
