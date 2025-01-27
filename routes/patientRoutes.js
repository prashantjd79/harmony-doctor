const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadMedicalHistory } = require('../controllers/patientController');
const upload = require('../middleware/uploadMiddleware');
const {
    signupPatient,
    verifyEmail,
    loginPatient,
    viewServices,
    bookSession, addJournalEntry, viewJournals, deleteJournalEntry,getAvailableSlots,
    payForSession, viewPaymentHistory, getAllDoctors, getDoctorById
} = require('../controllers/patientController');

router.post('/signup', signupPatient); // Signup
router.post('/verify-email', verifyEmail); // Email Verification
router.post('/login', loginPatient); // Login
router.get('/services', viewServices); 
router.post('/book-session', protect, bookSession);
router.post('/journals', protect, addJournalEntry); // Add a journal entry
router.get('/journals', protect, viewJournals); // View all journal entries
router.delete('/journals/:journalId', protect, deleteJournalEntry); // Delete a journal entry
router.post('/available-slots', protect, getAvailableSlots);
router.post('/pay', protect, payForSession);
router.post('/medical-history', protect, upload.single('file'), uploadMedicalHistory);
// View payment history
router.get('/payment-history', protect, viewPaymentHistory);
router.get('/doctors', protect, getAllDoctors);

// Get specific doctor by ID
router.get('/doctors/:doctorId', protect, getDoctorById);
module.exports = router;
