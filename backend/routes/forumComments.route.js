const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.get('/posts/:postId/comments', protect, forumController.getComments);
router.post('/posts/:postId/comments', protect, forumController.addComment);
router.put('/comments/:id', protect, forumController.updateComment);
router.delete('/comments/:id', protect, forumController.deleteComment);
router.post('/comments/:id/upvote', protect, forumController.upvoteComment);

module.exports = router;