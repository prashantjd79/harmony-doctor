// // const express = require('express');
// // const router = express.Router();
// // const { doctorSignup, doctorLogin } = require('../controllers/doctorAuthController');
// // const { getCategories, getServices,viewUpcomingSessions } = require('../controllers/doctorController');
// // const { getDoctorSessionHistory } = require('../controllers/doctorController');

// // // Doctor Session History Route

// // const { protect ,doctorProtect} = require('../middleware/authMiddleware');
// // const doctorController = require('../controllers/doctorController');
// // const sessionController = require('../controllers/sessionController');
// // // Doctor Authentication Routes
// // router.post('/signup', doctorSignup); // Doctor signup
// // router.post('/login', doctorLogin); // Doctor login
// // router.get('/patients/:patientId', protect, doctorProtect, doctorController.viewPatientProfile);
// // // Doctor View Routes (protected)
// // router.get('/categories', protect, getCategories); // View categories
// // router.get('/services', protect, getServices); // View services
// // router.get('/upcoming-sessions', protect, viewUpcomingSessions); 
// // router.put('/services/:serviceId/pricing', protect, doctorProtect, doctorController.enrollPricing);
// // router.put('/availability', protect, doctorProtect, doctorController.updateAvailability);
// // router.put('/sessions/:sessionId/reschedule', protect, doctorProtect, sessionController.rescheduleAppointment);
// // router.post('/sessions', protect, doctorProtect, doctorController.createSessionUnderDoctor);
// // router.get('/patients/:patientId/profile', protect, doctorProtect, doctorController.viewUserProfile)
// // router.get('/session-history', protect, doctorProtect, getDoctorSessionHistory);

// // module.exports = router;
// const express = require('express');
// const router = express.Router();

// // ✅ Import Controllers
// const { doctorSignup, doctorLogin } = require('../controllers/doctorAuthController');
// const { 
//     fetchDoctorSessions, 
//     getAllDoctorSessions,
//     getCategories, 
//     getServices, 
//     viewUpcomingSessions, 
//     viewPatientProfile,
//     enrollPricing,
//     updateAvailability,
//     createSessionUnderDoctor,
//     viewUserProfile
// } = require('../controllers/doctorController');

// const { rescheduleAppointment } = require('../controllers/sessionController');
// const { protect, doctorProtect } = require('../middleware/authMiddleware');

// // 🏥 **Doctor Authentication Routes**
// router.post('/signup', doctorSignup);
// router.post('/login', doctorLogin);
// router.get('/all-sessions', protect, doctorProtect, getAllDoctorSessions); 
// // 📌 **Doctor Views & Services (Protected)**
// router.get('/categories', protect, doctorProtect, getCategories);
// router.get('/services', protect, doctorProtect, getServices);
// router.get('/upcoming-sessions', protect, doctorProtect, viewUpcomingSessions);
// router.get('/my-sessions', protect, doctorProtect, fetchDoctorSessions);

// // 🔄 **Doctor Availability & Pricing**
// router.put('/services/:serviceId/pricing', protect, doctorProtect, enrollPricing);
// router.put('/availability', protect, doctorProtect, updateAvailability);

// // 👨‍⚕️ **Patient Details**
// router.get('/patients/:patientId/profile', protect, doctorProtect, viewUserProfile);
// router.get('/patients/:patientId', protect, doctorProtect, viewPatientProfile);

// // 📅 **Session Management**
// router.put('/sessions/:sessionId/reschedule', protect, doctorProtect, rescheduleAppointment);
// router.post('/sessions', protect, doctorProtect, createSessionUnderDoctor);

// module.exports = router;

const express = require('express');
const router = express.Router();

const { 
    doctorSignup, doctorLogin 
} = require('../controllers/doctorAuthController');
const { 
    getCategories, 
    getServices, 
    viewUpcomingSessions, 
    viewPatientProfile, 
    enrollPricing, 
    updateAvailability, 
     
} = require('../controllers/doctorController');
const { getDoctorSessions } = require('../controllers/doctorController');
const { protect, doctorProtect } = require('../middleware/authMiddleware');

// 🔐 Authentication
router.post('/signup', doctorSignup);
router.post('/login', doctorLogin);

// 📌 Doctor Services
router.get('/categories', protect, doctorProtect, getCategories);
router.get('/services', protect, doctorProtect, getServices);

// 📅 Session Management
router.get('/upcoming-sessions', protect, doctorProtect, viewUpcomingSessions);
// router.get('/sessions/all', protect, doctorProtect, getAllDoctorSessions);
router.get('/sessions', protect, doctorProtect, getDoctorSessions);

// 🏥 Pricing & Availability
router.put('/services/:serviceId/pricing', protect, doctorProtect, enrollPricing);
router.put('/availability', protect, doctorProtect, updateAvailability);

// 🩺 Patient Profile
router.get('/patients/:patientId/profile', protect, doctorProtect, viewPatientProfile);

module.exports = router;
