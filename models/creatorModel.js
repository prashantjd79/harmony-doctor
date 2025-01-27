const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const creatorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        contactNumber: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String, required: true },
        profilePicture: { type: String, required: true }, // URL for the photo
        description: { type: String, required: true },
        isApproved: { type: Boolean, default: false }, // Approval by Admin
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manager',
        }, // Reference to the assigned Manager
    },
    { timestamps: true }
);

// Hash password before saving
creatorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

creatorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Creator = mongoose.model('Creator', creatorSchema);
module.exports = Creator;
