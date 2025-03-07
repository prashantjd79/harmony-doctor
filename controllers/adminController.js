const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const Session = require('../models/sessionModel');
const Doctor = require('../models/doctorModel');
const Service = require('../models/serviceModel');
const PromoCode = require("../models/promoCodeModel");
const Patient = require("../models/patientModel");
const Blog = require('../models/blogModels');
const Article = require('../models/articleModel');
const YoutubeBlog = require('../models/youtubeBlogModel.js');
const Manager = require('../models/managerModel');
const Creator = require('../models/creatorModel');








const getDoctorFinancialReport = asyncHandler(async (req, res) => {
    const doctorPayments = await Session.aggregate([
        { $match: { "paymentDetails.status": "Paid" } }, // ✅ Only Paid Sessions
        {
            $lookup: {
                from: "doctors",
                localField: "doctor",
                foreignField: "_id",
                as: "doctorInfo"
            }
        },
        { $unwind: "$doctorInfo" },
        {
            $lookup: {
                from: "services",
                localField: "service",
                foreignField: "_id",
                as: "serviceInfo"
            }
        },
        { $unwind: "$serviceInfo" },
        {
            $group: {
                _id: "$doctor",
                doctorName: { $first: "$doctorInfo.name" },
                totalSessions: { $sum: 1 },
                totalEarnings: { 
                    $sum: { $ifNull: ["$paymentDetails.amount", 0] } // ✅ Ensure `amount` is included
                },
                services: {
                    $push: {
                        serviceId: "$service",
                        serviceName: "$serviceInfo.name",
                        sessionCount: { $sum: 1 },
                        totalEarnings: { 
                            $sum: { $ifNull: ["$paymentDetails.amount", 0] } // ✅ Ensure `amount` is included
                        }
                    }
                }
            }
        }
    ]);

    res.status(200).json({
        message: "Doctor financial report retrieved successfully.",
        doctorPayments
    });
});








const createPromoCode = asyncHandler(async (req, res) => {
    const { code, discountPercentage, validTill, applicableTransactions, specialForMentalHealth } = req.body;

    try {
        // Check if promo code already exists
        const existingPromo = await PromoCode.findOne({ code });
        if (existingPromo) {
            res.status(400);
            throw new Error("Promo code already exists.");
        }

        // Create new promo code
        const newPromo = await PromoCode.create({
            code,
            discountPercentage,
            validTill,
            applicableTransactions: applicableTransactions || null, // ✅ Transaction-based promo
            specialForMentalHealth: specialForMentalHealth || false // ✅ Mental health-based promo
        });

        res.status(201).json({
            success: true,
            message: "Promo Code created successfully",
            promoCode: newPromo
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating promo code", error: error.message });
    }
});

const getAllPromoCodes = asyncHandler(async (req, res) => {
    try {
        const promoCodes = await PromoCode.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: promoCodes.length,
            promoCodes
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching promo codes",
            error: error.message
        });
    }
});

const deletePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const promoCode = await PromoCode.findById(id);
        if (!promoCode) {
            res.status(404);
            throw new Error("Promo Code not found");
        }

        await promoCode.deleteOne(); // ✅ Remove promo code from database

        res.status(200).json({
            success: true,
            message: "Promo Code deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting promo code",
            error: error.message
        });
    }
});

const createService = asyncHandler(async (req, res) => {
    const {
        name,
        title,
        image,
        description,
        category,
        relatedTags,
        relatedSubtitles,
        discussionTopics,
        benefits,
        languages,
        duration,
        price,
    } = req.body;

    // Validate required fields
    if (
        !name ||
        !title ||
        !image ||
        !description ||
        !category ||
        !discussionTopics ||
        !benefits ||
        !languages ||
        !duration ||
        !price
    ) {
        res.status(400);
        throw new Error(
            'All required fields (name, title, image, description, category, discussionTopics, benefits, languages, duration, price) must be filled'
        );
    }

    // Check if the category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        res.status(404);
        throw new Error('Category does not exist');
    }

    // Check if a service with the same name already exists
    const serviceExists = await Service.findOne({ name });
    if (serviceExists) {
        res.status(400);
        throw new Error('Service already exists');
    }

    // Create the service
    const service = await Service.create({
        name,
        title,
        image,
        description,
        category,
        relatedTags,
        relatedSubtitles,
        discussionTopics,
        benefits,
        languages,
        duration,
        price,
    });

    // Respond with the complete service details
    res.status(201).json({
        message: 'Service created successfully',
        service: {
            id: service._id,
            name: service.name,
            title: service.title,
            image: service.image,
            description: service.description,
            category: service.category,
            relatedTags: service.relatedTags,
            relatedSubtitles: service.relatedSubtitles,
            discussionTopics: service.discussionTopics,
            benefits: service.benefits,
            languages: service.languages,
            duration: service.duration,
            price: service.price,
        },
    });
});



const getServices = asyncHandler(async (req, res) => {
    try {
        const services = await Service.find({})
            .populate("category", "name") // ✅ Fetch Category Name
            .populate("doctorPricing.doctor", "name specialization") // ✅ Fetch Doctor Details in Pricing
            .sort({ createdAt: -1 }); // ✅ Sort by most recent

        if (!services.length) {
            return res.status(404).json({ message: "No services found." });
        }

        res.status(200).json({
            message: "All services retrieved successfully.",
            services,
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});



const getServiceById = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error("Service not found");
    }

    res.status(200).json(service);
});

const getManagers = asyncHandler(async (req, res) => {
    try {
        const managers = await Manager.find().select("-password"); // Exclude sensitive data
        res.status(200).json(managers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching managers", error: error.message });
    }
});

const getCreators = asyncHandler(async (req, res) => {
    try {
        const creators = await Creator.find().select("-password"); // Exclude sensitive data
        res.status(200).json(creators);
    } catch (error) {
        res.status(500).json({ message: "Error fetching creators", error: error.message });
    }
});

const updateService = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, category, duration, price } = req.body;

    const service = await Service.findById(id);

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    const categoryExists = category ? await Category.findById(category) : true;

    if (category && !categoryExists) {
        res.status(404);
        throw new Error('Category does not exist');
    }

    service.name = name || service.name;
    service.description = description || service.description;
    service.category = category || service.category;
    service.duration = duration || service.duration;
    service.price = price || service.price;

    const updatedService = await service.save();

    res.status(200).json(updatedService);
});

const deleteService = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        console.log("🔍 Deleting Service ID:", id);

        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            console.log("❌ Service Not Found");
            return res.status(404).json({ error: "Service not found" });
        }

        console.log("✅ Service Deleted Successfully");

        res.status(200).json({ message: "Service deleted successfully" });

    } catch (error) {
        console.error("❌ Error in deleteService:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});


const createCategory = asyncHandler(async (req, res) => {
    const { name, description, icon } = req.body;

    if (!name || !icon) {
        res.status(400);
        throw new Error('Category name and icon are required');
    }

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({ name, description, icon });

    res.status(201).json({
        message: 'Category created successfully',
        category,
    });
});

const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.status(200).json(categories);
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    category.name = name || category.name;
    category.description = description || category.description;

    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    await category.remove();

    res.status(200).json({ message: 'Category deleted successfully' });
});

const viewSessionHistories = asyncHandler(async (req, res) => {
    const sessions = await Session.find({})
        .populate('patient', 'name email') // Adjust fields based on your User model
        .populate('doctor', 'name specialization') // Adjust fields based on your Doctor model
        .populate('service', 'name description'); // Adjust fields based on your Service model

    if (!sessions || sessions.length === 0) {
        res.status(404);
        throw new Error('No session histories found');
    }

    res.status(200).json(sessions);
});

const viewDoctorProfiles = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({});
    if (!doctors || doctors.length === 0) {
        res.status(404);
        throw new Error('No doctor profiles found');
    }

    res.status(200).json(doctors);
});

const approveDoctor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    doctor.isApproved = true;
    const updatedDoctor = await doctor.save();

    res.status(200).json({
        message: `Doctor ${doctor.name} has been approved`,
        doctor: updatedDoctor,
    });
});

const disapproveDoctor = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.isApproved = false;
    await doctor.save();

    res.status(200).json({ message: "Doctor disapproved successfully!" });
});


const approveManager = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const manager = await Manager.findById(id);

    if (!manager) {
        res.status(404);
        throw new Error('Manager not found');
    }

    manager.isApproved = true;
    await manager.save();

    res.status(200).json({ message: 'Manager approved successfully' });
});

const disapproveManager = asyncHandler(async (req, res) => {
    const { managerId } = req.params;

    const manager = await Manager.findById(managerId);
    if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
    }

    manager.isApproved = false;
    await manager.save();

    res.status(200).json({ message: "Manager disapproved successfully!" });
});

const approveCreator = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const creator = await Creator.findById(id);

    if (!creator) {
        res.status(404);
        throw new Error('Creator not found');
    }

    creator.isApproved = true;
    await creator.save();

    res.status(200).json({ message: 'Creator approved successfully' });
});

const disapproveCreator = asyncHandler(async (req, res) => {
    const { creatorId } = req.params;

    const creator = await Creator.findById(creatorId);
    if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
    }

    creator.isApproved = false;
    await creator.save();

    res.status(200).json({ message: "Creator disapproved successfully!" });
});


const assignToManager = asyncHandler(async (req, res) => {
    const { managerId, doctorIds, creatorIds } = req.body;

    // Validate manager
    const manager = await Manager.findById(managerId);
    if (!manager) {
        res.status(404);
        throw new Error('Manager not found.');
    }

    // Assign doctors and creators
    if (doctorIds) {
        manager.assignedDoctors = [...new Set([...manager.assignedDoctors, ...doctorIds])];
    }
    if (creatorIds) {
        manager.assignedCreators = [...new Set([...manager.assignedCreators, ...creatorIds])];
    }

    await manager.save();

    res.status(200).json({
        message: 'Doctors and creators assigned to manager successfully.',
        manager,
    });
});

const getAdminStats = asyncHandler(async (req, res) => {
    // Fetch numbers dynamically from the database
    const totalAppointments = await Session.countDocuments({});
    const certifiedDoctors = await Doctor.countDocuments({ isApproved: true });
    const registeredUsers = await Patient.countDocuments({});
    const totalBlogs = await Blog.countDocuments({});
    const totalEarnings = await Session.aggregate([{ $group: { _id: null, total: { $sum: "$paymentDetails.amount" } } }]);
    const earningsThisMonth = await Session.aggregate([
        {
            $match: {
                date: { $gte: new Date(new Date().setDate(1)) } // Earnings from the start of the month
            }
        },
        { $group: { _id: null, total: { $sum: "$paymentDetails.amount" } } }
    ]);

    const activeDoctors = await Doctor.countDocuments({ isApproved: true, isDisabled: false });
    const pendingDoctors = await Doctor.countDocuments({ isApproved: false });
    const totalDoctors = await Doctor.countDocuments({});
    const totalServices = await Service.countDocuments({});
    const totalCategories = await Category.countDocuments({});
    const temporarilyOffDoctors = await Doctor.countDocuments({ isDisabled: true });
    const inactiveDoctors = await Doctor.countDocuments({ isActive: false });

    const totalYtContent = await YoutubeBlog.countDocuments({});
    const pendingYtContent = await YoutubeBlog.countDocuments({ isApproved: false });
    const totalArticles = await Article.countDocuments({});
    const pendingArticles = await Article.countDocuments({ isApproved: false });
    const pendingBlogs = await Blog.countDocuments({ isApproved: false });

    const rejectedArticles = await Article.countDocuments({ isRejected: true });
    const publishBlogs = await Blog.countDocuments({ isApproved: true });
    const unpublishBlogs = await Blog.countDocuments({ isPublished: false });
    const rejectedBlogs = await Blog.countDocuments({ isRejected: true });
    const improveBlogs = await Blog.countDocuments({ needsImprovement: true });

    const publishArticles = await Article.countDocuments({ isApproved: true });
    const unpublishArticles = await Article.countDocuments({ isPublished: false });
    const improveArticles = await Article.countDocuments({ needsImprovement: true });

    const publishYtContent = await YoutubeBlog.countDocuments({ isApproved: true });
    const unpublishYtContent = await YoutubeBlog.countDocuments({ isPublished: false });
    const improveYtContent = await YoutubeBlog.countDocuments({ needsImprovement: true });
    const rejectedYtContent = await YoutubeBlog.countDocuments({ isRejected: true });

    const totalCreators = await Creator.countDocuments({});
    const activeCreators = await Creator.countDocuments({ isApproved: true });
    const inactiveCreators = await Creator.countDocuments({ isActive: false });
    const temporarilyOffCreators = await Creator.countDocuments({ isDisabled: true });

    const totalManagers = await Manager.countDocuments({});
    const activeManagers = await Manager.countDocuments({ isApproved: true });
    const inactiveManagers = await Manager.countDocuments({ isActive: false });
    const temporarilyOffManagers = await Manager.countDocuments({ isDisabled: true });

    res.status(200).json({
        appointments: { number: totalAppointments, name: "Total Appointments" },
        certifiedDoctors: { number: certifiedDoctors, name: "Certified Doctors" },
        registeredUser: { number: registeredUsers, name: "Registered Users" },
        totalBlogs: { number: totalBlogs, name: "Total Blogs" },
        earningTillNow: { number: totalEarnings.length > 0 ? totalEarnings[0].total : 0, name: "Total Earnings" },
        earningThisMonth: { number: earningsThisMonth.length > 0 ? earningsThisMonth[0].total : 0, name: "Earnings This Month" },
        activeDoctors: { number: activeDoctors, name: "Active Doctors" },
        pendingDoctors: { number: pendingDoctors, name: "Pending Doctors" },
        totalDoctors: { number: totalDoctors, name: "Total Doctors" },
        totalServices: { number: totalServices, name: "Total Services" },
        totalCategories: { number: totalCategories, name: "Total Categories" },
        temporarilyOffDoctors: { number: temporarilyOffDoctors, name: "Temporarily Off Doctors" },
        inactiveDoctors: { number: inactiveDoctors, name: "Inactive Doctors" },
        totalYtContent: { number: totalYtContent, name: "Total YouTube Content" },
        pendingYtContent: { number: pendingYtContent, name: "Pending YouTube Content" },
        totalArticles: { number: totalArticles, name: "Total Articles" },
        pendingArticles: { number: pendingArticles, name: "Pending Articles" },
        pendingBlogs: { number: pendingBlogs, name: "Pending Blogs" },
        rejectedArticles: { number: rejectedArticles, name: "Rejected Articles" },
        publishBlogs: { number: publishBlogs, name: "Published Blogs" },
        unpublishBlogs: { number: unpublishBlogs, name: "Unpublished Blogs" },
        rejectedBlogs: { number: rejectedBlogs, name: "Rejected Blogs" },
        improveBlogs: { number: improveBlogs, name: "Blogs Needing Improvement" },
        publishArticles: { number: publishArticles, name: "Published Articles" },
        unpublishArticles: { number: unpublishArticles, name: "Unpublished Articles" },
        improveArticles: { number: improveArticles, name: "Articles Needing Improvement" },
        publishYtContent: { number: publishYtContent, name: "Published YouTube Content" },
        unpublishYtContent: { number: unpublishYtContent, name: "Unpublished YouTube Content" },
        improveYtContent: { number: improveYtContent, name: "YouTube Content Needing Improvement" },
        rejectedYtContent: { number: rejectedYtContent, name: "Rejected YouTube Content" },
        totalCreators: { number: totalCreators, name: "Total Creators" },
        activeCreators: { number: activeCreators, name: "Active Creators" },
        inactiveCreators: { number: inactiveCreators, name: "Inactive Creators" },
        temporarilyOffCreators: { number: temporarilyOffCreators, name: "Temporarily Off Creators" },
        totalManagers: { number: totalManagers, name: "Total Managers" },
        activeManagers: { number: activeManagers, name: "Active Managers" },
        inactiveManagers: { number: inactiveManagers, name: "Inactive Managers" },
        temporarilyOffManagers: { number: temporarilyOffManagers, name: "Temporarily Off Managers" }
    });
});

const getTopConsultants = asyncHandler(async (req, res) => {
    const consultants = await Session.aggregate([
        { $match: { status: "Completed" } }, // Filter only completed sessions
        {
            $group: {
                _id: "$doctor",
                totalSessions: { $sum: 1 } // Count completed sessions per doctor
            }
        },
        { $sort: { totalSessions: -1 } }, // Sort by highest session count
        { $limit: 5 } // Get only top 5 consultants
    ]);

    if (!consultants.length) {
        return res.status(404).json({ message: "No consultants found" });
    }

    // Fetch doctor details
    const topConsultants = await Doctor.find({ _id: { $in: consultants.map(c => c._id) } })
        .select("name specialization experience profilePicture")
        .limit(5);

    res.status(200).json(topConsultants);
});

const getTopServices = asyncHandler(async (req, res) => {
    const topServices = await Session.aggregate([
        { $match: { status: "Completed" } },
        {
            $group: {
                _id: "$service",
                totalBookings: { $sum: 1 }
            }
        },
        { $sort: { totalBookings: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "services",
                localField: "_id",
                foreignField: "_id",
                as: "serviceDetails"
            }
        },
        { $unwind: "$serviceDetails" },
        {
            $lookup: {
                from: "categories",
                localField: "serviceDetails.category",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        { $unwind: "$categoryDetails" },
        {
            $project: {
                _id: 0,
                serviceId: "$_id",
                serviceName: "$serviceDetails.name",
                categoryName: "$categoryDetails.name",
                totalBookings: 1
            }
        }
    ]);

    res.status(200).json({
        message: "Top services retrieved successfully.",
        topServices
    });
});


const getTopCategories = asyncHandler(async (req, res) => {
    const topCategories = await Session.aggregate([
        { $match: { status: "Completed" } },
        {
            $lookup: {
                from: "services",
                localField: "service",
                foreignField: "_id",
                as: "serviceDetails"
            }
        },
        { $unwind: "$serviceDetails" },
        {
            $group: {
                _id: "$serviceDetails.category",
                totalBookings: { $sum: 1 }
            }
        },
        { $sort: { totalBookings: -1 } },
        { $limit: 5 }
    ]);

    const categories = await Category.find({ _id: { $in: topCategories.map(c => c._id) } })
        .select("name description icon");

    res.status(200).json(categories);
});

const getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await Session.aggregate([
        { $match: { status: "Completed", reviews: { $exists: true, $ne: [] } } }, // Only completed sessions with reviews
        { $unwind: "$reviews" }, // Expand the reviews array
        {
            $lookup: {
                from: "patients",
                localField: "reviews.patient",
                foreignField: "_id",
                as: "patientDetails"
            }
        },
        {
            $lookup: {
                from: "doctors",
                localField: "doctor",
                foreignField: "_id",
                as: "doctorDetails"
            }
        },
        {
            $project: {
                _id: 1,
                doctorId: { $arrayElemAt: ["$doctorDetails._id", 0] },
                doctorName: { $arrayElemAt: ["$doctorDetails.name", 0] },
                patientId: { $arrayElemAt: ["$patientDetails._id", 0] },
                patientName: { $arrayElemAt: ["$patientDetails.name", 0] },
                rating: "$reviews.rating",
                comment: "$reviews.comment",
                createdAt: "$reviews.createdAt"
            }
        },
        { $sort: { createdAt: -1 } } // Sort by most recent reviews
    ]);

    if (!reviews.length) {
        return res.status(404).json({ message: "No reviews found" });
    }

    res.status(200).json(reviews);
});


const getAllSessionReviews = asyncHandler(async (req, res) => {
    try {
        // **Find all sessions with reviews**
        const sessions = await Session.find({ "reviews": { $exists: true, $ne: [] } })
            .populate("doctor", "name specialization") // Fetch doctor details
            .populate("patient", "name email") // Fetch patient details
            .sort({ date: -1 }); // Sort by most recent

        if (!sessions.length) {
            return res.status(404).json({ message: "No reviews found" });
        }

        // **Format Data for Response**
        const reviews = sessions.flatMap(session =>
            session.reviews.map(review => ({
                sessionId: session._id,
                doctor: { id: session.doctor._id, name: session.doctor.name, specialization: session.doctor.specialization },
                patient: { id: session.patient._id, name: session.patient.name, email: session.patient.email },
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }))
        );

        res.status(200).json({ message: "All session reviews retrieved successfully.", reviews });
    } catch (error) {
        console.error("Error fetching session reviews:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});



// ✅ Edit (Update) Assigned Doctors & Creators for a Manager
const editAssignedToManager = asyncHandler(async (req, res) => {
    const { managerId, doctorIds, creatorIds } = req.body;

    // Validate manager
    const manager = await Manager.findById(managerId);
    if (!manager) {
        return res.status(404).json({ error: "Manager not found." });
    }

    // Update assigned Doctors and Creators
    if (doctorIds) {
        // Ensure only unique doctor IDs are stored
        manager.assignedDoctors = [...new Set(doctorIds)];
    }
    if (creatorIds) {
        // Ensure only unique creator IDs are stored
        manager.assignedCreators = [...new Set(creatorIds)];
    }

    await manager.save();

    res.status(200).json({
        message: "Assigned doctors and creators updated successfully.",
        manager,
    });
});





module.exports = {
    createCategory,
    editAssignedToManager,
    getCategories,
    updateCategory,
    deleteCategory,
    createService,
    getServices,
    updateService,
    deleteService,
    viewSessionHistories,
    viewDoctorProfiles,
    approveDoctor,
    approveCreator,
    approveManager,assignToManager,
    getServiceById,getManagers,getCreators,getAdminStats,getTopCategories,getTopConsultants,getTopServices,getAllReviews,
    
 createPromoCode, getAllPromoCodes,  deletePromoCode,disapproveCreator,disapproveManager,disapproveDoctor,getAllSessionReviews,getDoctorFinancialReport

};

