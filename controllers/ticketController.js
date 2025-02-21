const Ticket = require('../models/ticketModel');
const asyncHandler = require('express-async-handler');

// ✅ Create a Ticket (All Users: Doctor, Patient, Creator, Manager)
const createTicket = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required to create a ticket.');
    }

    // Convert userRole to match enum values properly
    const roleMapping = {
        doctor: "Doctor",
        patient: "Patient",
        creator: "Creator",
        manager: "Manager",
    };

    const userType = roleMapping[req.userRole.toLowerCase()]; // Convert to match enum

    if (!userType) {
        res.status(400);
        throw new Error('Invalid user role.');
    }

    const ticket = await Ticket.create({
        raisedBy: req.user._id, 
        userType,
        message,
    });

    res.status(201).json({
        message: 'Ticket created successfully.',
        ticket,
    });
});


// ✅ Get All Tickets (Admin Only)
const getAllTickets = asyncHandler(async (req, res) => {
    if (req.userRole !== 'admin') {
        res.status(403);
        throw new Error('Access denied. Only admins can view tickets.');
    }

    const tickets = await Ticket.find().populate('raisedBy', 'name email');

    res.status(200).json({
        message: 'All tickets retrieved successfully.',
        tickets,
    });
});

// ✅ Get Tickets for Logged-in User (User-Specific)
const getUserTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find({ raisedBy: req.user._id });

    res.status(200).json({
        message: 'User-specific tickets retrieved successfully.',
        tickets,
    });
});

// ✅ Admin Reply to a Ticket
const replyToTicket = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (req.userRole !== 'admin') {
        res.status(403);
        throw new Error('Access denied. Only admins can reply to tickets.');
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found.');
    }

    ticket.replies.push({
        admin: req.user._id,
        message,
        date: new Date(),
    });

    await ticket.save();

    res.status(200).json({
        message: 'Reply added successfully.',
        ticket,
    });
});

// ✅ Update Ticket Status (Admin Only)
const updateTicketStatus = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (req.userRole !== 'admin') {
        res.status(403);
        throw new Error('Access denied. Only admins can update ticket status.');
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found.');
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({
        message: 'Ticket status updated successfully.',
        ticket,
    });
});

module.exports = { 
    createTicket, 
    getAllTickets, 
    getUserTickets, 
    replyToTicket, 
    updateTicketStatus 
};
