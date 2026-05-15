import { body, param, query, validationResult } from 'express-validator';

// Handle validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// Auth validators
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validate,
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// Project validators
export const createProjectValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'archived'])
    .withMessage('Invalid status value'),
  validate,
];

export const updateProjectValidator = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  validate,
];

// Task validators
export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'overdue'])
    .withMessage('Invalid status value'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID for assignment'),
  validate,
];

export const updateTaskValidator = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'overdue'])
    .withMessage('Invalid status value'),
  validate,
];

// Comment validator
export const addCommentValidator = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  validate,
];

// MongoDB ID param validator
export const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];
