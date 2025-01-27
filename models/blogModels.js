const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        heading: { type: String, required: true },
        content: { type: String, required: true }, // Quill or Rich Text
        categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // Can be blank
        tags: [{ type: String }],
        description: { type: String },
        bannerImage: { type: String, required: true }, // Path to the uploaded image
        creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
        isApproved: {
            type: Boolean,
            default: false,
        }, // Linked to the creator
    },
    { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
