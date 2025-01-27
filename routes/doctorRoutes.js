const express = require('express');
const router = express.Router();
const { doctorSignup, doctorLogin } = require('../controllers/doctorAuthController');
const { getCategories, getServices,viewUpcomingSessions, } = require('../controllers/doctorController');
const { protect ,doctorProtect} = require('../middleware/authMiddleware');
const doctorController = require('../controllers/doctorController');
const sessionController = require('../controllers/sessionController');
// Doctor Authentication Routes
router.post('/signup', doctorSignup); // Doctor signup
router.post('/login', doctorLogin); // Doctor login
router.get('/patients/:patientId', protect, doctorProtect, doctorController.viewPatientProfile);
// Doctor View Routes (protected)
router.get('/categories', protect, getCategories); // View categories
router.get('/services', protect, getServices); // View services
router.get('/upcoming-sessions', protect, viewUpcomingSessions); 
router.put('/services/:serviceId/pricing', protect, doctorProtect, doctorController.enrollPricing);
router.put('/availability', protect, doctorProtect, doctorController.updateAvailability);
router.put('/sessions/:sessionId/reschedule', protect, doctorProtect, sessionController.rescheduleAppointment);
router.post('/sessions', protect, doctorProtect, doctorController.createSessionUnderDoctor);
router.get('/patients/:patientId/profile', protect, doctorProtect, doctorController.viewUserProfile)
module.exports = router;
