


const Session = require('../models/sessionModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
const Service = require('../models/serviceModel');
const asyncHandler = require('express-async-handler');



const moment = require('moment');
















// ✅ Mark Doctor as Absent
const markDoctorAbsent = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
        return res.status(404).json({ error: "Session not found" });
    }

    // ✅ Update session status to "Doctor Absent"
    session.status = "Doctor Absent";
    await session.save();

    res.status(200).json({
        message: "Doctor marked as absent successfully",
        session,
    });
});





// Reschedule an appointment
const rescheduleAppointment = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
        res.status(400);
        throw new Error('New date and time slot are required');
    }

    const session = await Session.findById(sessionId);

    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    // Check if the session is scheduled
    if (session.status !== 'Scheduled') {
        res.status(400);
        throw new Error('Only scheduled appointments can be rescheduled');
    }

    // Calculate the time difference between now and the session date
    const currentDateTime = new Date();
    const sessionDateTime = new Date(session.date);

    const timeDifference = (sessionDateTime - currentDateTime) / (1000 * 60 * 60); // Convert to hours

    // Restrict rescheduling if within 48 hours
    if (timeDifference <= 48) {
        res.status(400);
        throw new Error('Rescheduling is not allowed within 48 hours of the appointment');
    }

    // Update the session with the new date and time slot
    session.date = newDate;
    session.timeSlot = newTimeSlot;

    const updatedSession = await session.save();

    res.status(200).json({
        message: 'Appointment rescheduled successfully',
        session: updatedSession,
    });
});



module.exports = { rescheduleAppointment,markDoctorAbsent };
