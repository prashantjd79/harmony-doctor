const asyncHandler = require('express-async-handler');
const Manager = require('../models/managerModel');

// Manager Signup
const Article = require('../models/articleModel');
const Blog = require('../models/blogModels');
const YoutubeBlog = require('../models/youtubeBlogModel.js');
const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const Ticket = require('../models/ticketModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Creator = require('../models/creatorModel');
const getManagerStats = asyncHandler(async (req, res) => {
    // Fetch numbers dynamically from the database
    const totalManagers = await Manager.countDocuments({});
    const activeManagers = await Manager.countDocuments({ isApproved: true });
    const inactiveManagers = await Manager.countDocuments({ isActive: false });
    const temporarilyOffManagers = await Manager.countDocuments({ isDisabled: true });

    const totalCreators = await Creator.countDocuments({});
    const activeCreators = await Creator.countDocuments({ isApproved: true });
    const inactiveCreators = await Creator.countDocuments({ isActive: false });
    const temporarilyOffCreators = await Creator.countDocuments({ isDisabled: true });
    const pendingCreators = await Creator.countDocuments({ isApproved: false });

    const totalYtContent = await YoutubeBlog.countDocuments({});
    const pendingYtContent = await YoutubeBlog.countDocuments({ isApproved: false });
    const publishYtContent = await YoutubeBlog.countDocuments({ isApproved: true });
    const unpublishYtContent = await YoutubeBlog.countDocuments({ isPublished: false });
    const improveYtContent = await YoutubeBlog.countDocuments({ needsImprovement: true });
    const rejectedYtContent = await YoutubeBlog.countDocuments({ isRejected: true });

    const totalBlogs = await Blog.countDocuments({});
    const pendingBlogs = await Blog.countDocuments({ isApproved: false });
    const publishBlogs = await Blog.countDocuments({ isApproved: true });
    const unpublishBlogs = await Blog.countDocuments({ isPublished: false });
    const improveBlogs = await Blog.countDocuments({ needsImprovement: true });
    const rejectedBlogs = await Blog.countDocuments({ isRejected: true });

    const totalArticles = await Article.countDocuments({});
    const pendingArticles = await Article.countDocuments({ isApproved: false });
    const publishArticles = await Article.countDocuments({ isApproved: true });
    const unpublishArticles = await Article.countDocuments({ isPublished: false });
    const improveArticles = await Article.countDocuments({ needsImprovement: true });
    const rejectedArticles = await Article.countDocuments({ isRejected: true });

    res.status(200).json({
        totalManagers: { number: totalManagers, name: "Total Managers" },
        activeManagers: { number: activeManagers, name: "Active Managers" },
        inactiveManagers: { number: inactiveManagers, name: "Inactive Managers" },
        temporarilyOffManagers: { number: temporarilyOffManagers, name: "Temporarily Off Managers" },

        totalCreators: { number: totalCreators, name: "Total Creators" },
        activeCreators: { number: activeCreators, name: "Active Creators" },
        inactiveCreators: { number: inactiveCreators, name: "Inactive Creators" },
        temporarilyOffCreators: { number: temporarilyOffCreators, name: "Temporarily Off Creators" },
        pendingCreators: { number: pendingCreators, name: "Pending Creators" },

        totalYtContent: { number: totalYtContent, name: "Total YouTube Content" },
        pendingYtContent: { number: pendingYtContent, name: "Pending YouTube Content" },
        publishYtContent: { number: publishYtContent, name: "Published YouTube Content" },
        unpublishYtContent: { number: unpublishYtContent, name: "Unpublished YouTube Content" },
        improveYtContent: { number: improveYtContent, name: "YouTube Content Needing Improvement" },
        rejectedYtContent: { number: rejectedYtContent, name: "Rejected YouTube Content" },

        totalBlogs: { number: totalBlogs, name: "Total Blogs" },
        pendingBlogs: { number: pendingBlogs, name: "Pending Blogs" },
        publishBlogs: { number: publishBlogs, name: "Published Blogs" },
        unpublishBlogs: { number: unpublishBlogs, name: "Unpublished Blogs" },
        improveBlogs: { number: improveBlogs, name: "Blogs Needing Improvement" },
        rejectedBlogs: { number: rejectedBlogs, name: "Rejected Blogs" },

        totalArticles: { number: totalArticles, name: "Total Articles" },
        pendingArticles: { number: pendingArticles, name: "Pending Articles" },
        publishArticles: { number: publishArticles, name: "Published Articles" },
        unpublishArticles: { number: unpublishArticles, name: "Unpublished Articles" },
        improveArticles: { number: improveArticles, name: "Articles Needing Improvement" },
        rejectedArticles: { number: rejectedArticles, name: "Rejected Articles" }
    });
});

// Manager Login
const managerLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const manager = await Manager.findOne({ email });

    if (manager && (await bcrypt.compare(password, manager.password))) {
        if (!manager.isApproved) {
            res.status(403);
            throw new Error('Your account is not approved by the admin');
        }

        res.status(200).json({
            id: manager._id,
            name: manager.name,
            email: manager.email,
            token: generateToken(manager._id),
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






const managerSignup = asyncHandler(async (req, res) => {
    const { name, email, password, contactNumber, topEducation, country, state, profilePicture, description } = req.body;

    const managerExists = await Manager.findOne({ email });

    if (managerExists) {
        res.status(400);
        throw new Error('Manager already exists');
    }

    const manager = await Manager.create({
        name,
        email,
        password,
        contactNumber,
        topEducation,
        country,
        state,
        profilePicture,
        description,
    });

    if (manager) {
        res.status(201).json({
            message: 'Signup successful. Please wait for admin approval.',
            id: manager._id,
            isApproved: manager.isApproved,
        });
    } else {
        res.status(400);
        throw new Error('Invalid manager data');
    }
});



// Approve Content (Articles, Blogs, Videos)
const approveContent = asyncHandler(async (req, res) => {
    const { contentType, contentId } = req.body;

    // Validate contentType
    if (!['article', 'blog', 'youtubeBlog'].includes(contentType)) {
        res.status(400);
        throw new Error('Invalid content type. Must be article, blog, or youtubeBlog.');
    }

    // Find and approve the content based on type
    let content;
    switch (contentType) {
        case 'article':
            content = await Article.findById(contentId);
            break;
        case 'blog':
            content = await Blog.findById(contentId);
            break;
        case 'youtubeBlog':
            content = await YoutubeBlog.findById(contentId);
            break;
    }

    // Check if the content exists
    if (!content) {
        res.status(404);
        throw new Error('Content not found.');
    }

    // Approve the content
    content.isApproved = true; // Ensure there's an `isApproved` field in your schema
    await content.save();

    res.status(200).json({
        message: `${contentType} approved successfully.`,
        content,
    });
});



// Disable/Enable Doctor or Patient
const toggleProfileStatus = asyncHandler(async (req, res) => {
    const { userType, userId, status } = req.body;

    if (!['doctor', 'patient'].includes(userType)) {
        res.status(400);
        throw new Error('Invalid user type. Must be doctor or patient.');
    }

    let user;
    if (userType === 'doctor') {
        user = await Doctor.findById(userId);
    } else if (userType === 'patient') {
        user = await Patient.findById(userId);
    }

    if (!user) {
        res.status(404);
        throw new Error(`${userType.charAt(0).toUpperCase() + userType.slice(1)} not found.`);
    }

    user.isDisabled = status;
    await user.save();

    res.status(200).json({
        message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} profile ${status ? 'disabled' : 'enabled'} successfully.`,
        user,
    });
});




// Reply to a Ticket
const replyToTicket = asyncHandler(async (req, res) => {
    const { ticketId, message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Reply message is required.');
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found.');
    }

    ticket.replies.push({
        manager: req.user._id,
        message,
    });

    await ticket.save();

    res.status(200).json({
        message: 'Reply added successfully.',
        ticket,
    });
});
const viewProfile = asyncHandler(async (req, res) => {
    const { userType, userId } = req.params;

    let user;
    if (userType === 'doctor') {
        user = await Doctor.findById(userId);
    } else if (userType === 'patient') {
        user = await Patient.findById(userId);
    } else {
        res.status(400);
        throw new Error('Invalid user type. Must be doctor or patient.');
    }

    if (!user) {
        res.status(404);
        throw new Error(`${userType.charAt(0).toUpperCase() + userType.slice(1)} not found.`);
    }

    res.status(200).json(user);
});





// ✅ Get All Managers
const getAllManagers = asyncHandler(async (req, res) => {
    try {
        const managers = await Manager.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: managers.length,
            managers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching managers",
            error: error.message
        });
    }
});

// ✅ Get All Patients
const getAllPatients = asyncHandler(async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching patients",
            error: error.message
        });
    }
});




// ✅ Get All Blogs Created by Creators
const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({}).populate("creator", "name email"); // Fetch creator details
    res.status(200).json({
        message: "All blogs retrieved successfully.",
        blogs
    });
});

// ✅ Get All Articles Created by Creators
const getAllArticles = asyncHandler(async (req, res) => {
    const articles = await Article.find({}).populate("creator", "name email"); // Fetch creator details
    res.status(200).json({
        message: "All articles retrieved successfully.",
        articles
    });
});

// ✅ Get All YouTube Blogs Created by Creators
const getAllYoutubeBlogs = asyncHandler(async (req, res) => {
    const youtubeBlogs = await YoutubeBlog.find({}).populate("creator", "name email"); // Fetch creator details
    res.status(200).json({
        message: "All YouTube blogs retrieved successfully.",
        youtubeBlogs
    });
});








// ✅ Manager gets all assigned Doctors & Creators
const getAssignedDoctorsAndCreators = asyncHandler(async (req, res) => {
    const managerId = req.user._id; // Get logged-in Manager ID

    const manager = await Manager.findById(managerId)
        .populate("assignedDoctors", "name email")
        .populate("assignedCreators", "name email");

    if (!manager) {
        return res.status(404).json({ error: "Manager not found" });
    }

    res.status(200).json({
        message: "Assigned doctors and creators retrieved successfully.",
        assignedDoctors: manager.assignedDoctors,
        assignedCreators: manager.assignedCreators
    });
});








module.exports={managerSignup,getAssignedDoctorsAndCreators,managerLogin,approveContent,toggleProfileStatus,getAllBlogs, getAllArticles, getAllYoutubeBlogs ,replyToTicket,viewProfile,getAllManagers,getAllPatients,getManagerStats};