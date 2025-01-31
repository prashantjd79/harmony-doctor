const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    messages: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'senderType', // Can be doctor or patient
                required: true,
            },
            senderType: {
                type: String,
                enum: ['Doctor', 'Patient'],
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }
    ],
    isChatActive: {
        type: Boolean,
        default: true, // Chat is active before meeting ends
    },
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
