const Ticket = require('../models/ticketModel');
const asyncHandler = require('express-async-handler');
// Create a Ticket
const createTicket = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required to create a ticket.');
    }

    const userType = req.userRole === 'doctor' ? 'Doctor' : 'Patient';

    const ticket = await Ticket.create({
        raisedBy: req.user._id, // Logged-in user (Doctor or Patient)
        userType,
        message,
    });

    res.status(201).json({
        message: 'Ticket created successfully.',
        ticket,
    });
});
module.exports = { createTicket };