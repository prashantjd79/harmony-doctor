const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { managerProtect } = require("../middleware/authMiddleware");
const { managerSignup,managerLogin,approveContent,toggleProfileStatus ,getAllBlogs,getAllArticles,getAllYoutubeBlogs,replyToTicket,viewProfile,getManagerStats} = require('../controllers/managerController');
const { getAssignedDoctorsAndCreators } = require("../controllers/managerController");
const router = express.Router();
router.put('/reply-ticket', protect, replyToTicket);

router.post('/signup', managerSignup);
router.post('/login', managerLogin); 
router.put('/approve-content', protect, approveContent);
// router.put('/toggle-profile-status', protect, toggleProfileStatus);
router.get('/profiles/:userType/:userId', protect, viewProfile);
router.get("/stats", protect, managerProtect, getManagerStats);



router.get("/blogs", protect, managerProtect, getAllBlogs);
router.get("/articles", protect, managerProtect, getAllArticles);
router.get("/youtube-blogs", protect, managerProtect, getAllYoutubeBlogs);
router.get("/assigned", protect, managerProtect, getAssignedDoctorsAndCreators);

// ✅ Get all patients


module.exports = router;
