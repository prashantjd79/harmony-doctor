const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const { managerSignup,managerLogin,approveContent,toggleProfileStatus ,replyToTicket,viewProfile} = require('../controllers/managerController');
const router = express.Router();
router.put('/reply-ticket', protect, replyToTicket);

router.post('/signup', managerSignup);
router.post('/login', managerLogin); 
router.put('/approve-content', protect, approveContent);
router.put('/toggle-profile-status', protect, toggleProfileStatus);
router.get('/profiles/:userType/:userId', protect, viewProfile);

module.exports = router;
