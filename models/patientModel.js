const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        contactNumber: { type: String, required: true },
        birthday: { type: Date, required: true }, // For birthday notifications
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        isTakingConsultation: { type: Boolean, default: false }, // Consultation status
        isEmailVerified: { type: Boolean, default: false }, // Email verification status
        password: { type: String, required: true }, // Password for login
        otp: { type: String, required: false },
        isApproved: {
            type: Boolean,
            default: false,
        }, // OTP for email verification
        status: { 
            type: String, 
            enum: ['Active', 'Inactive', 'Pending Verification'], // Enum for valid statuses
            default: 'Active', // Default status is 'Active'
        },

        // New fields
        age: { type: Number, required: true }, // Patient's age
        address: { type: String, required: true }, 
        journals: [
            {
                title: { type: String, required: true },
                description: { type: String, required: true },
                date: { type: Date, default: Date.now },
            },
        ],// Address of the patient
        medicalHistory: [
            {
                document: { type: String, required: true },
                description: { type: String, required: true },
                date: { type: Date, default: Date.now },
            },
        ],
        notifications: [
            {
                message: { type: String, required: true }, // Notification message
                date: { type: Date, default: Date.now }, // Notification date
                read: { type: Boolean, default: false }, // Read/unread status
            },
        ],
        usedPromoCodes: [
            {
                code: { type: String },
                discountPercentage: { type: Number },
                appliedAt: { type: Date, default: Date.now }
            }
        ],
        createdAt: { type: Date, default: Date.now } // ✅ Stor
        
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
