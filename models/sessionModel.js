


const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    // doctorPricing: {  // ✅ Store the doctor’s pricing for this session
    //     type: Number,
    //     required: true,
    // },
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
        enum: ["Scheduled", "Completed", "Cancelled", "Paid", "Doctor Absent"],
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
    reviews: [  // <-- Changed from an object to an array of objects
        {
            patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    notes: {
        doctorNotes: { type: String }, // Notes from Doctor
        patientNotes: { type: String }, // Notes from Patient
    }
},

 { timestamps: true });

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;


