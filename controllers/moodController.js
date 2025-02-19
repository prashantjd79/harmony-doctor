const asyncHandler = require('express-async-handler');
const Mood = require('../models/moodModel');

// ✅ Submit Mood
const submitMood = asyncHandler(async (req, res) => {
    const { mood, reason, feelings } = req.body;
    const patientId = req.user._id; // Get patient ID from authentication middleware

    if (!mood || !reason) {
        res.status(400);
        throw new Error('Mood and reason are required.');
    }

    // Set a default value if "feelings" is not provided
    const moodEntry = await Mood.create({
        patient: patientId,
        mood,
        reason,
        feelings: feelings || "No additional details provided.",
        createdAt: new Date() // Ensure createdAt is stored
    });

    res.status(201).json({
        message: 'Mood entry submitted successfully!',
        moodEntry: {
            _id: moodEntry._id,
            patient: moodEntry.patient,
            mood: moodEntry.mood,
            reason: moodEntry.reason,
            feelings: moodEntry.feelings,
            createdAt: moodEntry.createdAt
        }
    });
});


// ✅ Get Mood History for a Patient
const getMoodHistory = asyncHandler(async (req, res) => {
    const patientId = req.user._id; // Get patient ID from authentication middleware

    const moods = await Mood.find({ patient: patientId }).sort({ createdAt: -1 });

    if (!moods || moods.length === 0) {
        res.status(404).json({ message: "No mood history found" });
        return;
    }

    res.status(200).json({
        message: "Mood history retrieved successfully",
        moods
    });
});













module.exports = { submitMood, getMoodHistory  };
