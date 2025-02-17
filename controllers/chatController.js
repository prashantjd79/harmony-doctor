const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const Session = require('../models/sessionModel');

const getChat = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    
    try {
        // Check if session exists
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        // Check if chat exists, if not, create a new chat
        let chat = await Chat.findOne({ sessionId });

        if (!chat) {
            chat = await Chat.create({
                sessionId,
                doctor: session.doctor,
                patient: session.patient,
                messages: [],
            });
        }

        res.status(200).json({ message: "Chat retrieved successfully.", chat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;
        const senderId = req.user._id;

        // Check if session exists
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        // Ensure the sender is either the doctor or the patient
        if (senderId.toString() !== session.patient.toString() && senderId.toString() !== session.doctor.toString()) {
            return res.status(403).json({ message: "You are not authorized to send messages for this session." });
        }

        // Determine sender type (Doctor or Patient)
        let senderType = senderId.toString() === session.doctor.toString() ? "Doctor" : "Patient";

        // Ensure chat is only allowed before the session ends
        if (session.status === "Completed") {
            return res.status(400).json({ message: "Chat is disabled after the session ends." });
        }

        // Check if a chat exists for this session
        let chat = await Chat.findOne({ sessionId });

        // If no chat exists, create a new one when the first message is sent
        if (!chat) {
            chat = await Chat.create({
                sessionId,
                doctor: session.doctor,
                patient: session.patient,
                messages: [],
            });
        }

        // Add the new message with senderType
        chat.messages.push({
            sender: senderId,
            senderType, // Now senderType is added (Doctor/Patient)
            message,
            timestamp: new Date(),
        });

        await chat.save();

        res.status(201).json({ message: "Message sent successfully", chat });

    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ error: error.message });
    }
});

const closeChat = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    try {
        // Find chat and disable further messaging
        const chat = await Chat.findOneAndUpdate(
            { sessionId },
            { isChatActive: false },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ message: "Chat not found." });
        }

        res.status(200).json({ message: "Chat has been closed.", chat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = { getChat, sendMessage, closeChat};
