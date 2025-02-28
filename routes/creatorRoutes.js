
const express = require('express');
const { protect, creatorProtect } = require('../middleware/authMiddleware');
const { singleUpload, multipleUpload } = require('../middleware/uploadMiddleware'); // ✅ Import correctly

const { 
    creatorSignup,
    creatorLogin,
    createArticle,
    // getArticles,
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
    getCreatorManager,
    // getAllBlogs,
    // getAllYouTubeBlogs
    getMyArticles,getMyBlogs,getMyYoutubeBlogs
} = require('../controllers/creatorController');

const router = express.Router();

// 🔹 **Creator Auth Routes**
router.post('/signup', creatorSignup);
router.post('/login', creatorLogin);

// 🔹 **Articles Routes**
router.post('/articles', protect, creatorProtect, singleUpload, createArticle);
// router.get('/articles',  getArticles);
router.get('/articles/:id',  getArticleById);
router.put('/articles/:id', protect, creatorProtect, singleUpload, updateArticle);
router.delete('/articles/:id', protect, creatorProtect, deleteArticle);

// 🔹 **Blogs Routes**
router.post('/blogs', protect, creatorProtect, singleUpload, createBlog);
router.get('/blogs/:id',  getBlogById);
router.put('/blogs/:id', protect, creatorProtect, singleUpload, updateBlog);
router.delete('/blogs/:id', protect, creatorProtect, deleteBlog);
// router.get("/all-blogs",  getAllBlogs);

// 🔹 **YouTube Blogs Routes**
router.post('/youtube-blogs', protect, creatorProtect, createYoutubeBlog);
router.get('/youtube-blogs/:id',  getYoutubeBlogById);
router.put('/youtube-blogs/:id', protect, creatorProtect, updateYoutubeBlog);
router.delete('/youtube-blogs/:id', protect, creatorProtect, deleteYoutubeBlog);
// router.get("/youtube-blogs",  getAllYouTubeBlogs);
router.get("/my-manager", protect, creatorProtect, getCreatorManager);

router.get("/my-blogs", protect, creatorProtect, getMyBlogs);
router.get("/my-articles", protect, creatorProtect, getMyArticles);
router.get("/my-youtube-blogs", protect, creatorProtect, getMyYoutubeBlogs);


module.exports = router;
