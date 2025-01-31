// const mongoose = require('mongoose');
// const sessionSchema = new mongoose.Schema({
//     patient: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Patient',
//         required: true,
//     },
//     doctor: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Doctor',
//         required: true,
//     },
//     service: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Service',
//         required: true,
//     },
//     date: {
//         type: Date,
//         required: true,
//     },
//     timeSlot: {
//         type: String,
//         required: true,
//     },
//     status: {
//         type: String,
//         enum: ['Scheduled', 'Completed', 'Cancelled', 'Paid'], // Add 'Paid' here
//         default: 'Scheduled',
//     },
// }, { timestamps: true });

// const Session = mongoose.model('Session', sessionSchema);

// module.exports = Session;
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Scheduled", "Completed", "Cancelled", "Paid"],
        default: "Scheduled",
    },
    paymentDetails: {
        transactionId: { type: String }, // Store payment transaction ID
        amount: { type: Number },
        method: { type: String, enum: ["Credit Card", "UPI", "PayPal", "Other"] },
        status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    },
    videoCall: {
        channelName: { type: String }, // Unique Agora Channel Name
        doctorToken: { type: String }, // Token for Doctor
        patientToken: { type: String }, // Token for Patient
        callStatus: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
    },
    notes: {
        doctorNotes: { type: String }, // Notes from Doctor
        patientNotes: { type: String }, // Notes from Patient
    }
}, { timestamps: true });

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
