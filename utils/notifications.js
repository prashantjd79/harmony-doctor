const Patient = require('../models/patientModel');

const addAppNotification = async (patientId, message) => {
    const patient = await Patient.findById(patientId);

    if (patient) {
        patient.notifications.push({ message });
        await patient.save();
    } else {
        throw new Error('Patient not found');
    }
};

module.exports = { addAppNotification };
