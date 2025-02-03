const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    
    mood: { 
        type: String, 
        enum: ['Happy', 'Sad', 'Angry', 'Anxious', 'Stressed', 'Excited', 'Neutral','Bored','Confused','Frustrated','Shy','Surprised','Lonely','Tired'], 
        required: true 
    },
    reason: { 
        type: String, 
        enum: ['Friends',
            'Family',
            'Sleep',
            'Leisure',
            'Driving',
            'Traffic',
            'Finances',
            'Loss of a loved one',
            'Relationships',
            'Breakup',
            'Work task',
            'Colleagues',
            'Boss',
            'Deadline',
            'Physical health',
            'Society',
            'Children',
            'Studies',
            'Career',
            'Marriage',
            'Diet/Fitness',
            'Others'], 
        required: true 
    },
    feelings: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Mood = mongoose.model('Mood', moodSchema);
module.exports = Mood;
