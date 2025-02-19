// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const doctorSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: true,
//         },
//         email: {
//             type: String,
//             required: true,
//             unique: true,
//         },
//         password: {
//             type: String,
//             required: true,
//         },
//         specialization: {
//             type: String,
//             required: true,
//         },
//         isApproved: {
//             type: Boolean,
//             default: false,
//         },
//         profilePicture: {
//             type: String,
//             required: false, // URL of the profile picture
//         },
//         qualifications: {
//             type: String,
//             required: true, // e.g., "MBBS, MD"
//         },
//         experience: {
//             type: Number, // Number of years
//             required: true,
//         },
//         availability: [
//             {
//                 date: {
//                     type: Date,
//                     required: true,
//                 },
//                 slots: [
//                     {
//                         start: { type: String, required: true }, // Start time, e.g., "10:00 AM"
//                         end: { type: String, required: true },   // End time, e.g., "11:00 AM"
//                     },
//                 ],
//             },
//         ],
//     },
//     { timestamps: true }
// );

// // Hash password before saving
// doctorSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });

// // Match entered password with hashed password
// doctorSchema.methods.matchPassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

// const Doctor = mongoose.model('Doctor', doctorSchema);

// module.exports = Doctor;



const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: { type: String, required: true },
        isDisabled: {
            type: Boolean,
            default: false,
        },
        
        specialization: {
            type: String,
            required: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        profilePicture: {
            type: String,
            required: false, // URL of the profile picture (1:1 square shape)
        },
        qualifications: {
            type: String,
            required: true, // e.g., "MBBS, MD"
        },
        experience: {
            type: Number, // Number of years
            required: true,
        },
        availability: [
            {
                date: {
                    type: Date,
                    required: true,
                },
                slots: [
                    {
                        start: { type: String, required: true }, // Start time, e.g., "10:00 AM"
                        end: { type: String, required: true },   // End time, e.g., "11:00 AM"
                    },
                ],
            },
        ],
        contactNumber: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        topEducation: {
            type: String,
            required: true,
        },
        expertiseCategories: [
            {
                type: String,
                required: true, // e.g., "Dermatology", "Cardiology"
            },
        ],
        country: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        attachedFiles: [
            {
                type: String, // URLs of uploaded files
            },
        ],
        description: {
            type: String,
            required: true, // Description or bio of the doctor
        },
    },
    { timestamps: true }
);

// Hash password before saving (DISABLE THIS TEMPORARILY)
doctorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    // const salt = await bcrypt.genSalt(10);
    // this.password = await bcrypt.hash(this.password, salt);
    next();
});


const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
