// const express = require('express');
// const { protect } = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware');
// const uploadMiddleware = require('../middleware/uploadMiddleware');
// const { creatorProtect } = require("../middleware/authMiddleware"); 

// const { creatorSignup,creatorLogin, createArticle,
//     getArticles,
//     getArticleById,
//     updateArticle,
//     deleteArticle,
//     getBlogById,
//     createYoutubeBlog,
//     updateYoutubeBlog,
//     deleteYoutubeBlog,
//     getYoutubeBlogById,
//     createBlog, updateBlog, deleteBlog } = require('../controllers/creatorController');
//     const { getAllBlogs } = require("../controllers/creatorController");
//     const { getAllYouTubeBlogs } = require("../controllers/creatorController");


// const router = express.Router();

// router.post('/signup', creatorSignup);
// router.post('/login', creatorLogin);
// router.post("/articles", protect, uploadMiddleware.singleUpload, createArticle);
// router.put("/articles/:id", protect, uploadMiddleware.singleUpload, updateArticle); // Create an article
// router.get('/articles', protect, getArticles); // Get all articles for logged-in creator
// router.get('/articles/:id', protect, getArticleById); // Get a specific article by ID
// router.put('/articles/:id', protect, upload.single('bannerImage'), updateArticle); // Update an article
// router.delete('/articles/:id', protect, deleteArticle); 
// router.get('/blogs/:id', protect, getBlogById);// Delete an article

// router.post('/blogs', protect, uploadMiddleware.single('bannerImage'), createBlog);
// router.put('/blogs/:id', protect, uploadMiddleware.single('bannerImage'), updateBlog);
// //router.delete('/blogs/:id', protect, deleteBlog);
// router.delete("/delete-blog/:id", protect, creatorProtect, deleteBlog);

// router.post('/youtube-blogs', protect, createYoutubeBlog);
// router.put('/youtube-blogs/:id', protect, updateYoutubeBlog);
// router.delete('/youtube-blogs/:id', protect, deleteYoutubeBlog);
// router.get('/youtube-blogs/:id', protect, getYoutubeBlogById);
// router.get("/all-blogs", protect, creatorProtect, getAllBlogs);
// router.get("/youtube-blogs", protect, creatorProtect, getAllYouTubeBlogs);
// module.exports = router;



const express = require('express');
const { protect, creatorProtect } = require('../middleware/authMiddleware');
const { singleUpload, multipleUpload } = require('../middleware/uploadMiddleware'); // ✅ Import correctly

const { 
    creatorSignup,
    creatorLogin,
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
    createBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    createYoutubeBlog,
    updateYoutubeBlog,
    deleteYoutubeBlog,
    getYoutubeBlogById,
    getAllBlogs,
    getAllYouTubeBlogs
} = require('../controllers/creatorController');

const router = express.Router();

// 🔹 **Creator Auth Routes**
router.post('/signup', creatorSignup);
router.post('/login', creatorLogin);

// 🔹 **Articles Routes**
router.post('/articles', protect, creatorProtect, singleUpload, createArticle);
router.get('/articles', protect, creatorProtect, getArticles);
router.get('/articles/:id', protect, creatorProtect, getArticleById);
router.put('/articles/:id', protect, creatorProtect, singleUpload, updateArticle);
router.delete('/articles/:id', protect, creatorProtect, deleteArticle);

// 🔹 **Blogs Routes**
router.post('/blogs', protect, creatorProtect, singleUpload, createBlog);
router.get('/blogs/:id', protect, creatorProtect, getBlogById);
router.put('/blogs/:id', protect, creatorProtect, singleUpload, updateBlog);
router.delete('/blogs/:id', protect, creatorProtect, deleteBlog);
router.get("/all-blogs", protect, creatorProtect, getAllBlogs);

// 🔹 **YouTube Blogs Routes**
router.post('/youtube-blogs', protect, creatorProtect, createYoutubeBlog);
router.get('/youtube-blogs/:id', protect, creatorProtect, getYoutubeBlogById);
router.put('/youtube-blogs/:id', protect, creatorProtect, updateYoutubeBlog);
router.delete('/youtube-blogs/:id', protect, creatorProtect, deleteYoutubeBlog);
router.get("/youtube-blogs", protect, creatorProtect, getAllYouTubeBlogs);

module.exports = router;
