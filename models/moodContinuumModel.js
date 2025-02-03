const mongoose = require('mongoose');

const moodContinuumSchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Patient', 
        required: true 
    },
    moodScore: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 4 
    },
    mood: { 
        type: String, 
        enum: ['Positive Mental Health', 'Mental Distress', 'Mental Disorder', 'Psychsocial Disablity'], 
        required: true 
    },
    // reason: { 
    //     type: String, 
    //     enum: ['Work', 'Family', 'Health', 'Finances', 'Others'], 
    //     default: 'Others' 
    // },
    // feelings: { 
    //     type: String, 
    //     default: "No additional details provided." 
    // },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const MoodContinuum = mongoose.model('MoodContinuum', moodContinuumSchema);
module.exports = MoodContinuum;
