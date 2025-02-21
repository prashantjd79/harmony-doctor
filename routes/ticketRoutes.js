const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/authMiddleware');
const { 
    createTicket, 
    getAllTickets, 
    getUserTickets, 
    replyToTicket, 
    updateTicketStatus 
} = require('../controllers/ticketController');
const router = express.Router();

// Create Ticket Route
router.post('/create', protect, createTicket);

// ✅ Users view their own tickets
router.get('/my-tickets', protect, getUserTickets);

// ✅ Admin gets all tickets
router.get('/all', protect, adminProtect, getAllTickets);

// ✅ Admin replies to a ticket
router.put('/reply/:ticketId', protect, adminProtect, replyToTicket);

// ✅ Admin updates ticket status
router.put('/status/:ticketId', protect, adminProtect, updateTicketStatus);
module.exports = router;
