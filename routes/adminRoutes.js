const express = require('express');
const { adminProtect } = require('../middleware/authMiddleware');
const { getAdminStats } = require("../controllers/adminController");

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
    approveCreator,assignToManager,getAllReviews,disapproveCreator,disapproveDoctor,disapproveManager,getAllSessionReviews,editAssignedToManager,
    getServiceById,getManagers,getCreators,getTopConsultants,getTopCategories,getTopServices,getDoctorFinancialReport
} = require('../controllers/adminController');
const { adminSignup, adminLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.put("/edit-assigned-to-manager", protect, adminProtect, editAssignedToManager);
// Authentication routes
router.get("/session-reviews", protect, adminProtect, getAllSessionReviews);
router.post('/signup', adminSignup);
router.post('/login', adminLogin);
router.get("/reviews", protect, adminProtect, getAllReviews);
router.get('/doctor-financials', protect, adminProtect, getDoctorFinancialReport);
router.put("/disapprove-doctor/:doctorId",protect,adminProtect, disapproveDoctor);
router.put("/disapprove-creator/:creatorId",protect,adminProtect, disapproveCreator);
router.put("/disapprove-manager/:managerId",protect,adminProtect, disapproveManager);
router.get("/stats", protect, adminProtect, getAdminStats);
router.get("/top-consultants", protect, adminProtect, getTopConsultants);
router.get("/top-services", protect, adminProtect, getTopServices);
router.get("/top-categories", protect, adminProtect, getTopCategories);
router.post('/categories', protect, createCategory);
router.get('/categories', protect, getCategories);
router.put('/categories/:id', protect, updateCategory);
router.delete('/categories/:id', protect, deleteCategory);
router.post('/services', protect, createService);
router.get('/services', protect, getServices);
router.put('/services/:id', protect, updateService);
router.delete('/services/:id', protect, deleteService);
router.get('/sessions', protect, viewSessionHistories);
router.get('/doctors', protect, viewDoctorProfiles); // View all doctor profiles
router.put('/doctors/:id/approve', protect, approveDoctor); // Approve a doctor
router.put('/approve-manager/:id', protect, adminProtect,approveManager);
router.put('/approve-creator/:id', protect, adminProtect, approveCreator); 
router.put('/assign-to-manager', protect, adminProtect, assignToManager);
router.get("/managers", protect, adminProtect, getManagers);
router.get("/service/:serviceId", protect, adminProtect, getServiceById);
router.get("/creators", protect, adminProtect, getCreators);







module.exports = router;
