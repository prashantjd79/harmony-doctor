// const mongoose = require('mongoose');

// const serviceSchema = new mongoose.Schema({
//     name: { type: String, required: true, unique: true },
//     description: { type: String, required: true },
//     category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
//     duration: { type: Number, required: true }, // Duration in minutes
//     price: { type: Number, required: true },
//     doctorPricing: [
//         {
//             doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
//             fee: { type: Number, required: true },
//         },
//     ],
// }, { timestamps: true });

// const Service = mongoose.model('Service', serviceSchema);

// module.exports = Service;


const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        image: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        relatedTags: [{ type: String }],
        relatedSubtitles: [{ type: String }],
        discussionTopics: { type: String, required: true },
        benefits: { type: String, required: true },
        languages: [{ type: String, required: true }],
        duration: { type: Number, required: true },
        price: { type: Number, required: true },
        doctorPricing: [
            {
                doctor: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Doctor',
                },
                fee: { type: Number },
            },
        ], // Doctor pricing will be added later
    },
    { timestamps: true }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
