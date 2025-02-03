const asyncHandler = require('express-async-handler');
const MoodContinuum = require('../models/moodContinuumModel');

// 📌 Submit Mood Continuum Entry
const submitMoodContinuum = asyncHandler(async (req, res) => {
    try {
        const { moodScore } = req.body;
        const patientId = req.user?._id;

        if (!moodScore || moodScore < 1 || moodScore > 4) {
            return res.status(400).json({ error: "MoodScore is required and must be between 1 and 4." });
        }

        if (!patientId) {
            return res.status(401).json({ error: "Patient authentication failed." });
        }

        // Automatically assign mood based on moodScore
        const moodMapping = {
            1: 'Positive Mental Health',   
            2: 'Mental Distress',
            3: 'Mental Disorder',
            4:'Psychsocial Disablity',
        };

        // Assign a default reason
        const defaultReasons = ["Work", "Family", "Health", "Finances"];
        const randomReason = defaultReasons[Math.floor(Math.random() * defaultReasons.length)];

        // Assign a default feelings message
        const defaultFeelings = "No additional details provided.";

        // Save to database
        const moodEntry = await MoodContinuum.create({
            patient: patientId,
            moodScore,
            mood: moodMapping[moodScore] || "Neutral",
            reason: randomReason,
            feelings: defaultFeelings,
        });

        res.status(201).json({
            message: "Mood submitted successfully.",
            moodEntry
        });

    } catch (error) {
        console.error("❌ Error in submitMoodContinuum:", error);
        res.status(500).json({ error: error.message });
    }
});

// 📌 Get Mood Continuum History for a Patient
const getMoodContinuumHistory = asyncHandler(async (req, res) => {
    try {
        const patientId = req.user?._id;

        if (!patientId) {
            return res.status(401).json({ error: "Patient authentication failed." });
        }

        const moods = await MoodContinuum.find({ patient: patientId }).sort({ createdAt: -1 });

        if (!moods || moods.length === 0) {
            return res.status(404).json({ message: "No mood history found." });
        }

        // Calculate average moodScore
        const avgMoodScore = moods.reduce((sum, entry) => sum + entry.moodScore, 0) / moods.length;

        res.status(200).json({
            message: "Mood history retrieved successfully.",
            moodHistory: moods,
            averageMoodScore: avgMoodScore.toFixed(2)
        });

    } catch (error) {
        console.error("❌ Error in getMoodContinuumHistory:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = { submitMoodContinuum, getMoodContinuumHistory };
