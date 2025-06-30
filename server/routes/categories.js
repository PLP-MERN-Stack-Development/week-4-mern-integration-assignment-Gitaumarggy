const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Category = require('../models/category');

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error('GET /api/categories Error:', err);
    res.status(500).json({ 
      error: 'Server Error',
      details: 'Failed to fetch categories' 
    });
  }
});

// @route   GET api/categories/:id
// @desc    Get single category
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error('GET /api/categories/:id Error:', err);
    res.status(500).json({ 
      error: 'Server Error',
      details: err.message 
    });
  }
});

// @route   POST api/categories
// @desc    Create a category
// @access  Public (for now)
router.post('/', [
  check('name', 'Category name is required')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  check('description', 'Description is required')
    .notEmpty()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: errors.array() 
    });
  }

  try {
    const { name, description } = req.body;

    const category = new Category({
      name,
      description
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('POST /api/categories Error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: 'Category name already exists' 
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: err.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Server Error',
      details: 'Failed to create category' 
    });
  }
});

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Public (for now)
router.put('/:id', [
  check('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  check('description')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: errors.array() 
    });
  }

  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(updatedCategory);
  } catch (err) {
    console.error('PUT /api/categories/:id Error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: 'Category name already exists' 
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: err.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Server Error',
      details: 'Failed to update category' 
    });
  }
});

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Public (for now)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Category deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/categories/:id Error:', err);
    res.status(500).json({ 
      error: 'Server Error',
      details: 'Failed to delete category' 
    });
  }
});

module.exports = router;