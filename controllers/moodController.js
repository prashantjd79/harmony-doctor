const asyncHandler = require('express-async-handler');
const Mood = require('../models/moodModel');

// ✅ Submit Mood
const submitMood = asyncHandler(async (req, res) => {
    const { mood, reason, feelings } = req.body;
    const patientId = req.user._id; // Get patient ID from authentication middleware

    if (!mood || !reason || !feelings) {
        res.status(400);
        throw new Error('All fields are required: mood, reason, and feelings');
    }

    // Create a new mood entry
    const moodEntry = await Mood.create({
        patient: patientId,
        mood,
        reason,
        feelings
    });

    res.status(201).json({
        message: 'Mood entry submitted successfully!',
        moodEntry
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




// 📌 Submit Mood Entry
const submitMoodContinuum = asyncHandler(async (req, res) => {
    try {
        console.log("📌 Received Request Body:", req.body);

        const { moodScore, mood, reason, feelings } = req.body;
        const patientId = req.user._id;

        // ✅ Ensure required fields exist
        if (!moodScore || !mood || !reason || !feelings) {
            return res.status(400).json({ error: "Mood score, mood, reason, and feelings are required." });
        }

        // ✅ Validate moodScore (must be between 1-4)
        if (moodScore < 1 || moodScore > 4) {
            return res.status(400).json({ error: "Mood score must be between 1 and 4." });
        }

        // ✅ Validate mood, reason, and feelings are correctly formatted
        const validMoods = ['Happy', 'Sad', 'Angry', 'Anxious', 'Stressed', 'Excited', 'Neutral', 'Bored', 'Confused', 'Frustrated', 'Shy', 'Surprised', 'Lonely', 'Tired'];
        const validReasons = [
            'Friends', 'Family', 'Sleep', 'Leisure', 'Driving', 'Traffic', 'Finances', 'Loss of a loved one', 'Relationships', 'Breakup',
            'Work task', 'Colleagues', 'Boss', 'Deadline', 'Physical health', 'Society', 'Children', 'Studies', 'Career', 'Marriage', 'Diet/Fitness', 'Others'
        ];

        if (!validMoods.includes(mood)) {
            return res.status(400).json({ error: "Invalid mood type selected." });
        }
        if (!validReasons.includes(reason)) {
            return res.status(400).json({ error: "Invalid reason type selected." });
        }

        // ✅ Store Mood Entry
        const moodEntry = await Mood.create({
            patient: patientId,
            moodScore,
            mood,
            reason,
            feelings
        });

        res.status(201).json({
            message: "Mood submitted successfully.",
            moodEntry
        });

    } catch (error) {
        console.error("❌ Error in submitMoodContinuum:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 Get Mood History & Average Mood Score
const getMoodContinuum = asyncHandler(async (req, res) => {
    try {
        const patientId = req.user._id;

        // ✅ Fetch all mood entries of the patient
        const moodEntries = await Mood.find({ patient: patientId }).sort({ createdAt: -1 });

        if (!moodEntries.length) {
            return res.status(404).json({ error: "No mood entries found." });
        }

        // ✅ Calculate Average Mood Score
        const totalScore = moodEntries.reduce((sum, entry) => sum + entry.moodScore, 0);
        const averageMood = totalScore / moodEntries.length;

        res.status(200).json({
            message: "Mood history retrieved successfully.",
            moodEntries,
            averageMood: parseFloat(averageMood.toFixed(2)) // Rounded to 2 decimal places
        });

    } catch (error) {
        console.error("❌ Error in getMoodContinuum:", error);
        res.status(500).json({ error: "Server error" });
    }
});










module.exports = { submitMood, getMoodHistory , submitMoodContinuum, getMoodContinuum };
