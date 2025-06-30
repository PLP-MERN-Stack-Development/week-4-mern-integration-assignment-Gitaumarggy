const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/post');
const Category = require('../models/category');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Validation middleware
const postValidation = [
  body('title').isString().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('content').isString().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category').isMongoId().withMessage('Valid category is required'),
];

// GET all posts with pagination, search, and filtering
router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', category } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category')
        .populate('author', 'username'),
      Post.countDocuments(query)
    ]);

    res.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('category').populate('author', 'username');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// CREATE post
router.post('/', auth, upload.single('featuredImage'), postValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ details: errors.array() });
  }
  try {
    const { title, content, category } = req.body;
    const featuredImage = req.file ? `/uploads/${req.file.filename}` : '';
    const post = new Post({
      title,
      content,
      category,
      featuredImage,
      author: req.user._id,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// UPDATE post
router.put('/:id', auth, upload.single('featuredImage'), postValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ details: errors.array() });
  }
  try {
    const { title, content, category } = req.body;
    const update = { title, content, category };
    let removeImage = req.body.removeImage === 'true' || req.body.removeImage === true;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    // Handle image removal
    if (removeImage && post.featuredImage) {
      const imagePath = path.join(__dirname, '..', post.featuredImage);
      fs.unlink(imagePath, err => {
        // Ignore error if file doesn't exist
      });
      update.featuredImage = '';
    }
    if (req.file) {
      update.featuredImage = `/uploads/${req.file.filename}`;
    }
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Comment text is required' });
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };
    post.comments.push(comment);
    await post.save();
    // Populate the user field for the new comment
    await post.populate({ path: 'comments.user', select: 'username' });
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.user', 'username');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

module.exports = router;