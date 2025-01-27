const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
    {
        heading: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category', // Assuming categories are stored in the 'Category' collection
            },
        ],
        bannerImage: {
            type: String, // Path to the uploaded banner image
        },
        tags: [
            {
                type: String, // Tags related to the article
            },
            
        ],
        description: {
            type: String,
            required: true, // Short description of the article
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Creator', // Reference to the creator who created this article
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    }
);

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
