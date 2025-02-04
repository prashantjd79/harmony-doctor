const express = require('express');
const { adminProtect } = require('../middleware/authMiddleware');

const router = express.Router();
const {
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
    approveManager,
    approveCreator,assignToManager,
    getServiceById,getManagers,getCreators
} = require('../controllers/adminController');
const { adminSignup, adminLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { createPromoCode, getAllPromoCodes, updatePromoCode, deletePromoCode, } = require("../controllers/adminController");

// Authentication routes
router.post('/signup', adminSignup);
router.post('/login', adminLogin);

// Category routes (protected)
router.post('/categories', protect, createCategory);
router.get('/categories', protect, getCategories);
router.put('/categories/:id', protect, updateCategory);
router.delete('/categories/:id', protect, deleteCategory);

// Service routes (protected)
router.post('/services', protect, createService);
router.get('/services', protect, getServices);
router.put('/services/:id', protect, updateService);
router.delete('/services/:id', protect, deleteService);
router.get('/sessions', protect, viewSessionHistories);
// Doctor routes (protected)
router.get('/doctors', protect, viewDoctorProfiles); // View all doctor profiles
router.put('/doctors/:id/approve', protect, approveDoctor); // Approve a doctor

router.put('/approve-manager/:id', approveManager); // Approve Manager
router.put('/approve-creator/:id', approveCreator); // Approve Creator
router.put('/assign-to-manager', protect, adminProtect, assignToManager);

router.get("/managers", protect, adminProtect, getManagers);
router.get("/service/:serviceId", protect, adminProtect, getServiceById);
router.get("/creators", protect, adminProtect, getCreators);



router.post("/promo-code", protect, adminProtect, createPromoCode);
router.get("/promo-codes", protect, adminProtect, getAllPromoCodes);
router.put("/promo-code/:id", protect, adminProtect, updatePromoCode);
router.delete("/promo-code/:id", protect, adminProtect, deletePromoCode);




module.exports = router;
