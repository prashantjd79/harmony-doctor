


const express = require("express");
const router = express.Router();
const { protect, patientProtect } = require("../middleware/authMiddleware");
const { uploadMedicalHistory } = require("../controllers/patientController");
const { medicalHistoryUpload } = require("../middleware/uploadMiddleware");
const { singleUpload } = require("../middleware/uploadMiddleware");
//const { uploadFields } = require("../middleware/uploadMiddleware")
const { submitSessionReview } = require('../controllers/patientController');
const { getMedicalHistory } = require("../controllers/patientController");

const upload = require("../middleware/uploadMiddleware");
const { submitMood, getMoodHistory  } = require('../controllers/moodController');
const { applyPromoCode } = require("../controllers/patientController");
const { getPatientPromoCodes } = require("../controllers/patientController");
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
    getUpcomingSessions,getPatientProfile,updatePatientProfile,getCategories,getBlogs,getYoutubeBlogs,getArticles,getTopConsultants,getCompletedMeetings,
    getMyHistory,resetPassword,getPatientReviews,getDoctorServices
    
} = require("../controllers/patientController");



const { markDoctorAbsent } = require("../controllers/sessionController");

router.get('/profile', protect, patientProtect, getPatientProfile);
router.put('/profile', protect, patientProtect, updatePatientProfile);
router.get('/categories', getCategories);
router.get('/blogs', getBlogs);
router.get('/youtube-blogs', getYoutubeBlogs);
router.get('/articles', getArticles);
router.get('/consultants/top', getTopConsultants);
router.get('/stats/completed-meetings', protect, patientProtect, getCompletedMeetings);
router.get("/medical-history", protect, patientProtect, getMedicalHistory);


// ✅ Patient Authentication & Signup
router.put("/sessions/mark-absent", protect, markDoctorAbsent);
router.post("/signup", signupPatient);
router.post("/verify-email", verifyEmail);
router.post("/login", loginPatient);
router.put('/sessions/:sessionId/review', protect, submitSessionReview);
// ✅ Viewing Services & Doctors
router.get("/services", protect, viewServices);
router.get("/doctors",  getAllDoctors);
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
router.post(
    "/upload-medical-history",
    protect,
    patientProtect,
    medicalHistoryUpload, // ✅ Uses correct upload middleware
    uploadMedicalHistory
);
router.post("/pay", protect, payForSession);
router.get("/payment-history", protect, viewPaymentHistory);
router.get('/sessions/upcoming', protect, patientProtect, getUpcomingSessions);
router.post('/mood', protect, submitMood);
router.get('/mood/history', protect, getMoodHistory); 
router.post('/mood/submit', protect, submitMoodContinuum);
router.get('/mood/continuum-history', protect, getMoodContinuumHistory);



router.get('/doctor/:doctorId/services', getDoctorServices);
router.get('/reviews', protect, patientProtect, getPatientReviews);
router.put('/reset-password',  resetPassword);
module.exports = router;
