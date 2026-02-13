// controllers/forumController.js
const { ForumPost, ForumComment, User } = require('../models');

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const { tag, sort = 'newest', page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (tag) query.tags = tag;
    
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { upvotes: -1 };
    if (sort === 'views') sortOption = { views: -1 };
    
    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortOption);
    
    const total = await ForumPost.countDocuments(query);
    
    // Get comment counts
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await ForumComment.countDocuments({ post: post._id });
        return {
          ...post.toObject(),
          commentCount,
          voteCount: post.upvotes.length - post.downvotes.length
        };
      })
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        posts: postsWithComments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Search posts
exports.searchPosts = async (req, res) => {
  try {
    const { q, tags } = req.query;
    
    const query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ];
    }
    if (tags) query.tags = { $in: tags.split(',') };
    
    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({
      status: 'success',
      data: { posts }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar');
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    const commentCount = await ForumComment.countDocuments({ post: post._id });
    
    res.status(200).json({
      status: 'success',
      data: {
        post: {
          ...post.toObject(),
          commentCount,
          voteCount: post.upvotes.length - post.downvotes.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create post
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const post = await ForumPost.create({
      title,
      content,
      tags: tags || [],
      author: req.user.id
    });
    
    await post.populate('author', 'name avatar');
    
    res.status(201).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const post = await ForumPost.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      { title, content, tags },
      { new: true }
    ).populate('author', 'name avatar');
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found or not authorized'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id
    });
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found or not authorized'
      });
    }
    
    // Delete all comments
    await ForumComment.deleteMany({ post: post._id });
    
    res.status(200).json({
      status: 'success',
      message: 'Post deleted'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Upvote post
exports.upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Remove from downvotes if exists
    post.downvotes = post.downvotes.filter(
      id => id.toString() !== req.user.id
    );
    
    // Toggle upvote
    const upvoteIndex = post.upvotes.findIndex(
      id => id.toString() === req.user.id
    );
    
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      post.upvotes.push(req.user.id);
    }
    
    await post.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        voteCount: post.upvotes.length - post.downvotes.length,
        userVote: upvoteIndex > -1 ? null : 'up'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Downvote post
exports.downvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Remove from upvotes if exists
    post.upvotes = post.upvotes.filter(
      id => id.toString() !== req.user.id
    );
    
    // Toggle downvote
    const downvoteIndex = post.downvotes.findIndex(
      id => id.toString() === req.user.id
    );
    
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    } else {
      post.downvotes.push(req.user.id);
    }
    
    await post.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        voteCount: post.upvotes.length - post.downvotes.length,
        userVote: downvoteIndex > -1 ? null : 'down'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get comments
exports.getComments = async (req, res) => {
  try {
    const comments = await ForumComment.find({ post: req.params.postId })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 });
    
    res.status(200).json({
      status: 'success',
      data: { comments }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    
    const comment = await ForumComment.create({
      post: req.params.postId,
      author: req.user.id,
      content,
      parentComment: parentComment || null
    });
    
    await comment.populate('author', 'name avatar');
    
    res.status(201).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const comment = await ForumComment.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      { content },
      { new: true }
    ).populate('author', 'name avatar');
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found or not authorized'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id
    });
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found or not authorized'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Comment deleted'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Upvote comment
exports.upvoteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    const upvoteIndex = comment.upvotes.findIndex(
      id => id.toString() === req.user.id
    );
    
    if (upvoteIndex > -1) {
      comment.upvotes.splice(upvoteIndex, 1);
    } else {
      comment.upvotes.push(req.user.id);
    }
    
    await comment.save();
    
    res.status(200).json({
      status: 'success',
      data: { upvotes: comment.upvotes.length }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// AI Summarize post
exports.summarizePost = async (req, res) => {
  try {
    const { postId } = req.body;
    
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // TODO: Integrate with AI API
    const mockSummary = `This post discusses ${post.tags.join(', ')}. The main points are: ${post.content.substring(0, 100)}...`;
    
    res.status(200).json({
      status: 'success',
      data: { summary: mockSummary }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
