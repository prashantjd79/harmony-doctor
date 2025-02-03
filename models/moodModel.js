const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    mood: { 
        type: String, 
        enum: ['Happy', 'Sad', 'Angry', 'Anxious', 'Stressed', 'Excited', 'Neutral'], 
        required: true 
    },
    reason: { 
        type: String, 
        enum: ['Work Stress', 'Financial Issues', 'Relationship', 'Health', 'Family', 'Other'], 
        required: true 
    },
    feelings: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Mood = mongoose.model('Mood', moodSchema);
module.exports = Mood;
