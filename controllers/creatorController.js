const asyncHandler = require('express-async-handler');
const Creator = require('../models/creatorModel');
const mongoose = require('mongoose');
// Creator Signup
const Blog = require('../models/blogModels');

const YoutubeBlog = require('../models/youtubeBlogModel.js');


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const Article = require('../models/articleModel');
const { required } = require('joi');
// const YouTubeBlog = require('../models/youtubeBlogModel');
// const Blog = require('../models/blogModel');

// ==========================
// Article CRUD Operations
// ==========================

// Create Article
const createArticle = asyncHandler(async (req, res) => {
    const { heading, content, categories, tags, description } = req.body;
    let parsedCategories = [];

    // Parse categories if passed as a string
    if (categories) {
        try {
            parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
        } catch (error) {
            res.status(400);
            throw new Error('Invalid categories format. Categories must be an array of valid IDs.');
        }
    }

    // Validate required fields
    if (!heading || !content || !description) {
        res.status(400);
        throw new Error('Heading, content, and description are required.');
    }

    // Ensure `creator` is set from the authenticated user
    const creatorId = req.user._id;

    // Create the article
    const article = await Article.create({
        heading,
        content,
        categories: parsedCategories,
        tags: tags ? tags.split(',') : [], // Split tags by commas
        description,
        bannerImage: req.file ? req.file.path : null,
        creator: creatorId, // Add creator field
    });

    res.status(201).json({
        message: 'Article created successfully',
        article,
    });
});



// Get All Articles
const getArticles = asyncHandler(async (req, res) => {
    const articles = await Article.find({ creator: req.user._id }) // Only creator's articles
        .populate('categories')
        .populate('creator', 'name email');
    res.status(200).json(articles);
});

// Get Article by ID
const getArticleById = asyncHandler(async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id, creator: req.user._id }) // Ensure ownership
        .populate('categories')
        .populate('creator', 'name email');
    if (!article) {
        res.status(404);
        throw new Error('Article not found or access denied');
    }
    res.status(200).json(article);
});

const updateArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { heading, content, categories, tags, description } = req.body;

    console.log('Request Params (ID):', id);
    console.log('Request Body:', req.body);

    // Find the article by ID
    const article = await Article.findById(id);
    if (!article) {
        console.error('Article not found with ID:', id);
        res.status(404);
        throw new Error('Article not found');
    }

    console.log('Original Article:', article);

    // Update fields selectively
    if (heading) {
        console.log('Updating heading:', heading);
        article.heading = heading;
    }
    if (content) {
        console.log('Updating content:', content);
        article.content = content;
    }

    // Update categories if provided
    if (categories) {
        console.log('Received categories:', categories);
        try {
            let parsedCategories;

            // Check if categories is a single ID or a JSON array
            if (typeof categories === 'string') {
                try {
                    parsedCategories = JSON.parse(categories); // Parse JSON if it's a stringified array
                } catch {
                    parsedCategories = [categories]; // Assume it's a single ID if JSON parsing fails
                }
            } else if (Array.isArray(categories)) {
                parsedCategories = categories; // Use directly if already an array
            } else {
                throw new Error('Categories must be a string or array.');
            }

            console.log('Parsed Categories:', parsedCategories);

            // Convert parsedCategories to ObjectId array
            article.categories = parsedCategories.map((cat) => new mongoose.Types.ObjectId(cat));
        } catch (error) {
            console.error('Invalid categories format:', error.message);
            res.status(400);
            throw new Error('Invalid categories format. Expected a valid JSON array or single category ID.');
        }
    }

    // Update tags if provided
    if (tags) {
        console.log('Received tags:', tags);
        article.tags = Array.isArray(tags) ? tags : tags.split(',').map((tag) => tag.trim());
        console.log('Updated Tags:', article.tags);
    }

    // Update description if provided
    if (description) {
        console.log('Updating description:', description);
        article.description = description;
    }

    // Update banner image if a new file is uploaded
    if (req.file) {
        console.log('Updating banner image with file:', req.file);
        article.bannerImage = req.file.path;
    }

    console.log('Final Article before saving:', article);

    // Save the updated article
    const updatedArticle = await article.save();

    console.log('Updated Article:', updatedArticle);

    res.status(200).json({
        message: 'Article updated successfully',
        article: updatedArticle,
    });
});




// Delete Article
const deleteArticle = asyncHandler(async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id, creator: req.user._id }); // Ensure ownership
    if (!article) {
        res.status(404);
        throw new Error('Article not found or access denied');
    }

    await article.remove();
    res.status(200).json({ message: 'Article deleted successfully' });
});

// ===========================
// Export Article Functions

const createBlog = asyncHandler(async (req, res) => {
    const { heading, content, categories, tags, description } = req.body;

    console.log('Request Body:', req.body);

    if (!heading || !content || !description) {
        res.status(400);
        throw new Error('Heading, content, and description are required fields');
    }

    // Parse and validate categories
    let parsedCategories = [];
    if (categories) {
        try {
            if (typeof categories === 'string') {
                try {
                    parsedCategories = JSON.parse(categories); // Parse JSON string
                } catch {
                    parsedCategories = [categories]; // Treat as single category ID
                }
            } else if (Array.isArray(categories)) {
                parsedCategories = categories;
            } else {
                throw new Error('Categories must be a string or array');
            }

            console.log('Parsed Categories:', parsedCategories);
            parsedCategories = parsedCategories.map((cat) => new mongoose.Types.ObjectId(cat));
        } catch (error) {
            console.error('Invalid categories format:', error.message);
            res.status(400);
            throw new Error('Invalid categories format. Expected a JSON array or single ID.');
        }
    }

    // Parse and validate tags
    const parsedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map((tag) => tag.trim())) : [];

    // Validate banner image
    if (!req.file) {
        res.status(400);
        throw new Error('Banner image is required');
    }

    const blog = await Blog.create({
        heading,
        content,
        categories: parsedCategories,
        tags: parsedTags,
        description,
        bannerImage: req.file.path, // Path to uploaded image
        creator: req.user._id, // Assign the logged-in creator's ID
    });

    console.log('Created Blog:', blog);

    res.status(201).json({
        message: 'Blog created successfully',
        blog,
    });
});


const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { heading, content, categories, tags, description } = req.body;

    console.log('Request Params (ID):', id);
    console.log('Request Body:', req.body);

    const blog = await Blog.findById(id);
    if (!blog) {
        res.status(404);
        throw new Error('Blog not found');
    }

    // Update fields selectively
    if (heading) blog.heading = heading;
    if (content) blog.content = content;

    if (categories) {
        try {
            let parsedCategories;

            if (typeof categories === 'string') {
                try {
                    parsedCategories = JSON.parse(categories);
                } catch {
                    parsedCategories = [categories];
                }
            } else if (Array.isArray(categories)) {
                parsedCategories = categories;
            } else {
                throw new Error('Invalid categories format');
            }

            blog.categories = parsedCategories.map((cat) => new mongoose.Types.ObjectId(cat));
        } catch (error) {
            res.status(400);
            throw new Error('Invalid categories format');
        }
    }

    if (tags) {
        blog.tags = Array.isArray(tags) ? tags : tags.split(',').map((tag) => tag.trim());
    }

    if (description) blog.description = description;

    if (req.file) {
        blog.bannerImage = req.file.path;
    }

    const updatedBlog = await blog.save();

    console.log('Updated Blog:', updatedBlog);

    res.status(200).json({
        message: 'Blog updated successfully',
        blog: updatedBlog,
    });
});
const getBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Retrieve the blog with populated creator
    const blog = await Blog.findById(id).populate('categories').populate('creator', 'name email');

    // Debug logs
    console.log("Logged-in Creator ID:", req.user._id);
    console.log("Blog's Creator ID:", blog ? blog.creator : 'Blog not found');

    // Check if the blog exists
    if (!blog) {
        res.status(404);
        throw new Error('Blog not found');
    }

    // Ensure the creator of the blog matches the logged-in creator
    if (blog.creator._id.toString() !== req.user._id.toString()) {
        console.log("Access Denied: Creator mismatch");
        res.status(403);
        throw new Error('Access denied. You are not authorized to view this blog');
    }

    res.status(200).json(blog);
});



// const deleteBlog = asyncHandler(async (req, res) => {
//     const { id } = req.params;

//     console.log('Request Params (ID):', id);

//     const blog = await Blog.findById(id);
//     if (!blog) {
//         res.status(404);
//         throw new Error('Blog not found');
//     }

//     await blog.remove();

//     res.status(200).json({
//         message: 'Blog deleted successfully',
//     });
// });



// Creator Login
const creatorLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const creator = await Creator.findOne({ email });

    if (creator && (await bcrypt.compare(password, creator.password))) {
        if (!creator.isApproved) {
            res.status(403);
            throw new Error('Your account is not approved by the admin');
        }

        res.status(200).json({
            id: creator._id,
            name: creator.name,
            email: creator.email,
            token: generateToken(creator._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};





const creatorSignup = asyncHandler(async (req, res) => {
    const { name, email, password, contactNumber, country, state, profilePicture, description } = req.body;

    const creatorExists = await Creator.findOne({ email });

    if (creatorExists) {
        res.status(400);
        throw new Error('Creator already exists');
    }

    const creator = await Creator.create({
        name,
        email,
        password,
        contactNumber,
        country,
        state,
        profilePicture,
        description,
    });

    if (creator) {
        res.status(201).json({
            message: 'Signup successful. Please wait for admin approval.',
            id: creator._id,
            isApproved: creator.isApproved,
        });
    } else {
        res.status(400);
        throw new Error('Invalid creator data');
    }
});


const createYoutubeBlog = asyncHandler(async (req, res) => {
    const { heading, iframeCode, content, categories, tags, description } = req.body;

    // Debugging logs
    console.log('Received Request Body:', req.body);

    // Check for required fields
    if (!heading || !iframeCode || !content || !description) {
        console.error('Missing required fields:', { heading, iframeCode, content, description });
        res.status(400);
        throw new Error('Heading, iframe code, content, and description are required.');
    }

    let parsedCategories = [];
    if (categories) {
        try {
            parsedCategories = Array.isArray(categories)
                ? categories
                : JSON.parse(categories); // Parse JSON if passed as a string
        } catch (error) {
            res.status(400);
            throw new Error('Invalid categories format. Expected a JSON array.');
        }
    }

    const youtubeBlog = await YoutubeBlog.create({
        heading,
        iframeCode,
        content,
        categories: parsedCategories.map((cat) => new mongoose.Types.ObjectId(cat)),
        tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
        description,
        creator: req.user._id,
    });

    res.status(201).json({
        message: 'YouTube Blog created successfully',
        youtubeBlog,
    });
});





const updateYoutubeBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { heading, iframeCode, content, categories, tags, description } = req.body;

    const youtubeBlog = await YoutubeBlog.findById(id);
    if (!youtubeBlog) {
        res.status(404);
        throw new Error('YouTube Blog not found.');
    }

    if (heading) youtubeBlog.heading = heading;
    if (iframeCode) youtubeBlog.iframeCode = iframeCode;
    if (content) youtubeBlog.content = content;
    if (categories) {
        try {
            const parsedCategories = Array.isArray(categories)
                ? categories
                : JSON.parse(categories);
            youtubeBlog.categories = parsedCategories.map((cat) => new mongoose.Types.ObjectId(cat));
        } catch (error) {
            res.status(400);
            throw new Error('Invalid categories format. Expected a JSON array.');
        }
    }
    if (tags) youtubeBlog.tags = tags.split(',').map((tag) => tag.trim());
    if (description) youtubeBlog.description = description;

    const updatedYoutubeBlog = await youtubeBlog.save();

    res.status(200).json({
        message: 'YouTube Blog updated successfully',
        youtubeBlog: updatedYoutubeBlog,
    });
});











const getYoutubeBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const youtubeBlog = await YoutubeBlog.findById(id).populate('categories').populate('creator', 'name email');
    if (!youtubeBlog) {
        res.status(404);
        throw new Error('YouTube Blog not found.');
    }

    if (youtubeBlog.creator._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Access denied. You are not authorized to view this YouTube Blog.');
    }

    res.status(200).json(youtubeBlog);
});


const deleteYoutubeBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const youtubeBlog = await YoutubeBlog.findById(id);
    if (!youtubeBlog) {
        res.status(404);
        throw new Error('YouTube Blog not found.');
    }

    await youtubeBlog.remove();

    res.status(200).json({
        message: 'YouTube Blog deleted successfully',
    });
});


// ✅ Get All Blogs
const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 }); // Fetch all blogs sorted by latest
        res.status(200).json({
            success: true,
            count: blogs.length,
            blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching blogs",
            error: error.message
        });
    }
});










// ✅ Delete a Blog by ID
const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        // 🔹 Step 1: Find the blog by ID
        const blog = await Blog.findById(id);
        if (!blog) {
            res.status(404);
            throw new Error("Blog not found");
        }

        // 🔹 Step 2: Fix field name from `creatorId` to `creator`
        if (!blog.creator) {
            res.status(400);
            throw new Error("This blog is missing a creator ID in the database.");
        }

        // 🔹 Step 3: Ensure the logged-in creator is the owner of the blog
        if (!req.user || !req.user._id) {
            res.status(401);
            throw new Error("Unauthorized: No user found in request.");
        }

        if (blog.creator.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("Unauthorized: You can only delete your own blog.");
        }

        // 🔹 Step 4: Delete the blog
        await Blog.findByIdAndDelete(id);
        res.status(200).json({ message: "Blog deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error deleting blog", error: error.message });
    }
});

















const getAllYouTubeBlogs = asyncHandler(async (req, res) => {
    try {
        // 🔹 Fetch all YouTube blogs sorted by latest
        const youtubeBlogs = await YoutubeBlog.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: youtubeBlogs.length,
            youtubeBlogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching YouTube blogs",
            error: error.message
        });
    }
});

module.exports={creatorSignup,creatorLogin, createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
    getBlogById,
    createYoutubeBlog,
    updateYoutubeBlog,
    deleteYoutubeBlog,
    getYoutubeBlogById,
createBlog,updateBlog,deleteBlog,getAllYouTubeBlogs,getAllBlogs};