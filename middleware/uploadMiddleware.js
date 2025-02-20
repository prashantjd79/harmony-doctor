// const multer = require("multer");
// const path = require("path");

// console.log("🚀 Multer Middleware Loaded...");

// // ✅ Define storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = path.join(__dirname, "../uploads/");
//         console.log(`📁 Upload Destination: ${uploadPath}`);
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueFileName = `${Date.now()}-${file.originalname}`;
//         console.log(`💾 Saving file as: ${uniqueFileName}`);
//         cb(null, uniqueFileName);
//     },
// });

// // ✅ Define file filter to allow only specific file types
// const fileFilter = (req, file, cb) => {
//     console.log(`🧐 Checking file type: ${file.mimetype}`);
//     const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

//     if (allowedTypes.includes(file.mimetype)) {
//         console.log("✅ File type is valid");
//         cb(null, true);
//     } else {
//         console.error("❌ Invalid file type. Only PDF, JPEG, and PNG are allowed.");
//         cb(new Error("Invalid file type. Only PDF, JPEG, and PNG are allowed."));
//     }
// };

// // ✅ Initialize multer upload configuration
// const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
// });

// // ✅ Export correctly as an object with named functions
// module.exports = {
//     singleUpload: upload.single("bannerImage"),  // For single file uploads
//     multipleUpload: upload.array("files", 5),   // For multiple file uploads
// };


const multer = require("multer");
const path = require("path");

console.log("🚀 Multer Middleware Loaded...");

// ✅ Define storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads/");
        console.log(`📁 Upload Destination: ${uploadPath}`);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueFileName = `${Date.now()}-${file.originalname}`;
        console.log(`💾 Saving file as: ${uniqueFileName}`);
        cb(null, uniqueFileName);
    },
});

// ✅ Define file filter to allow only specific file types
const fileFilter = (req, file, cb) => {
    console.log(`🧐 Checking file type: ${file.mimetype}`);
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (allowedTypes.includes(file.mimetype)) {
        console.log("✅ File type is valid");
        cb(null, true);
    } else {
        console.error("❌ Invalid file type. Only PDF, JPEG, and PNG are allowed.");
        cb(new Error("Invalid file type. Only PDF, JPEG, and PNG are allowed."));
    }
};

// ✅ Initialize multer upload configuration
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// ✅ Export correctly with named functions
module.exports = {
    singleUpload: upload.single("bannerImage"),  // For articles, blogs, YouTube blogs
    multipleUpload: upload.array("files", 5),   // For multiple file uploads

    // ✅ Medical History Upload (Ensures consistency)
    medicalHistoryUpload: upload.single("file"), // Use "file" as the field name
};
