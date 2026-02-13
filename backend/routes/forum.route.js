const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.get('/posts', protect, forumController.getAllPosts);
router.get('/posts/search', protect, forumController.searchPosts);
router.get('/posts/:id', protect, forumController.getPostById);
router.post('/posts', protect, forumController.createPost);
router.put('/posts/:id', protect, forumController.updatePost);
router.delete('/posts/:id', protect, forumController.deletePost);
router.post('/posts/:id/upvote', protect, forumController.upvotePost);
router.post('/posts/:id/downvote', protect, forumController.downvotePost);

module.exports = router;