const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChat, sendMessage, closeChat,deleteChat } = require('../controllers/chatController');

// 📌 Route to get or create chat for a session
router.get('/:sessionId', protect, getChat);

// 📌 Route to send message in chat
router.post('/:sessionId/send', protect, sendMessage);

// 📌 Route to close chat after session ends
router.put('/:sessionId/close', protect, closeChat);


module.exports = router;
