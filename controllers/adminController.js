const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const Session = require('../models/sessionModel');
const Doctor = require('../models/doctorModel');
const Service = require('../models/serviceModel');
const PromoCode = require("../models/promoCodeModel");
const Patient = require("../models/patientModel");







// ✅ Create a Promo Code (Either for Transactions or Mental Health)
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




// ✅ 2. Get All Promo Codes
const getAllPromoCodes = asyncHandler(async (req, res) => {
    try {
        const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: promoCodes.length,
            promoCodes
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching promo codes", error: error.message });
    }
});

// ✅ 3. Update a Promo Code
const updatePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code, discountPercentage, validTill, applicableTransactions, specialForMentalHealth } = req.body;

    try {
        const promoCode = await PromoCode.findById(id);
        if (!promoCode) {
            res.status(404);
            throw new Error("Promo Code not found");
        }

        promoCode.code = code || promoCode.code;
        promoCode.discountPercentage = discountPercentage || promoCode.discountPercentage;
        promoCode.validTill = validTill || promoCode.validTill;
        promoCode.applicableTransactions = applicableTransactions || promoCode.applicableTransactions;
        promoCode.specialForMentalHealth = specialForMentalHealth !== undefined ? specialForMentalHealth : promoCode.specialForMentalHealth;

        await promoCode.save();
        res.status(200).json({ success: true, message: "Promo Code updated successfully", promoCode });
    } catch (error) {
        res.status(500).json({ message: "Error updating promo code", error: error.message });
    }
});

// ✅ 4. Delete a Promo Code
const deletePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const promoCode = await PromoCode.findById(id);
        if (!promoCode) {
            res.status(404);
            throw new Error("Promo Code not found");
        }

        await promoCode.remove();
        res.status(200).json({ success: true, message: "Promo Code deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting promo code", error: error.message });
    }
});




// Ensure the path is correct
 // Ensure the path is correct


 // Make sure this path is correct




// const createService = asyncHandler(async (req, res) => {
//     const { name, description, category, duration, price, doctorPricing } = req.body;

//     // Validate required fields
//     if (!name || !description || !category || !duration || !price) {
//         res.status(400);
//         throw new Error('All required fields (name, description, category, duration, price) must be filled');
//     }

//     // Check if the category exists
//     const categoryExists = await Category.findById(category);
//     if (!categoryExists) {
//         res.status(404);
//         throw new Error('Category does not exist');
//     }

//     // Check if a service with the same name already exists
//     const serviceExists = await Service.findOne({ name });
//     if (serviceExists) {
//         res.status(400);
//         throw new Error('Service already exists');
//     }

//     // Validate doctorPricing
//     let validatedDoctorPricing = [];
//     if (doctorPricing && doctorPricing.length > 0) {
//         for (const pricing of doctorPricing) {
//             const doctorExists = await Doctor.findById(pricing.doctor);
//             if (!doctorExists) {
//                 res.status(404);
//                 throw new Error(`Doctor with ID ${pricing.doctor} not found`);
//             }
//             validatedDoctorPricing.push({
//                 doctor: pricing.doctor,
//                 fee: pricing.fee,
//             });
//         }
//     }

//     // Create the service
//     const service = await Service.create({
//         name,
//         description,
//         category,
//         duration,
//         price,
//         doctorPricing: validatedDoctorPricing,
//     });

//     // Respond with the complete service details
//     res.status(201).json({
//         message: 'Service created successfully',
//         service: {
//             id: service._id,
//             name: service.name,
//             description: service.description,
//             category: service.category,
//             duration: service.duration,
//             price: service.price,
//             doctorPricing: service.doctorPricing,
//         },
//     });
// });
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







// Get All Services
const getServices = asyncHandler(async (req, res) => {
    const services = await Service.find({}).populate('category', 'name');
    res.status(200).json(services);
});


// Get Service by ID
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



// Update Service
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

// Delete Service
const deleteService = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    await service.remove();

    res.status(200).json({ message: 'Service deleted successfully' });
});



// Create Category
// const createCategory = asyncHandler(async (req, res) => {
//     const { name, description } = req.body;

//     if (!name) {
//         res.status(400);
//         throw new Error('Category name is required');
//     }

//     const categoryExists = await Category.findOne({ name });

//     if (categoryExists) {
//         res.status(400);
//         throw new Error('Category already exists');
//     }

//     const category = await Category.create({ name, description });

//     res.status(201).json(category);
// });


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




// Get All Categories
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.status(200).json(categories);
});

// Update Category
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

// Delete Category
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


// View All Session Histories
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
// Approve a Doctor Profile
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

const Manager = require('../models/managerModel');
const Creator = require('../models/creatorModel');

// Approve Manager
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

// Approve Creator
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

module.exports = {
    createCategory,
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
    getServiceById,getManagers,getCreators,
    
 createPromoCode, getAllPromoCodes, updatePromoCode, deletePromoCode,

};

