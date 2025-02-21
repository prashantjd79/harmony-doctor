const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
    {
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'userType',
            required: true,
        },
        userType: {
            type: String,
            enum: ['Doctor', 'Patient', 'Creator', 'Manager'], // ✅ Expanded user roles
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        replies: [
            {
                admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // ✅ Admin can reply
                message: { type: String, required: true },
                date: { type: Date, default: Date.now },
            },
        ],
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved'], // ✅ Added status tracking
            default: 'Open',
        },
    },
    { timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
