const mongoose = require('mongoose');

const youtubeBlogSchema = new mongoose.Schema(
    {
        heading: {
            type: String,
            required: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        iframeCode: {
            type: String,
            required: true, // Holds the YT iframe embed code
        },
        content: {
            type: String,
            required: true, // Quill editor content (HTML)
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category', // Links to categories
            },
        ],
        tags: [
            {
                type: String,
            },
        ],
        description: {
            type: String,
            required: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Creator',
            required: true, // Links to the creator
        },
    },
    { timestamps: true }
);

const YoutubeBlog = mongoose.model('YoutubeBlog', youtubeBlogSchema);

module.exports = YoutubeBlog;
