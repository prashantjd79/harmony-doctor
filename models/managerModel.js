const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const managerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        contactNumber: { type: String, required: true },
        topEducation: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String, required: true },
        profilePicture: { type: String, required: true }, // URL for the photo
        description: { type: String, required: true },
        isApproved: { type: Boolean, default: false },
        
        assignedDoctors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Doctor',
            },
        ],
       
        assignedCreators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Creator',
            },
        ],
         // Approval by Admin
    },
    { timestamps: true }
);

// Hash password before saving
managerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

managerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Manager = mongoose.model('Manager', managerSchema);
module.exports = Manager;
