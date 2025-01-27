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
            enum: ['Doctor', 'Patient'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        replies: [
            {
                manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
                message: { type: String, required: true },
                date: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
