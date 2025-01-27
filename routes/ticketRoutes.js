const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createTicket } = require('../controllers/ticketController');

const router = express.Router();

// Create Ticket Route
router.post('/create-ticket', protect, createTicket);

module.exports = router;
