import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
  updateTaskStatus
} from '../controllers/task.controller.js';
import { adminOnly, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('project').isMongoId().withMessage('Valid project ID is required'),
  body('assignedTo').isMongoId().withMessage('Valid assignee ID is required'),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
];

router.use(protect);

router.route('/')
  .get(query('project').optional().isMongoId().withMessage('Invalid project ID'), validate, getTasks)
  .post(adminOnly, taskValidation, validate, createTask);

router.patch(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status')
  ],
  validate,
  updateTaskStatus
);

router.route('/:id')
  .get(param('id').isMongoId().withMessage('Invalid task ID'), validate, getTask)
  .put(adminOnly, param('id').isMongoId(), taskValidation, validate, updateTask)
  .delete(adminOnly, param('id').isMongoId(), validate, deleteTask);

export default router;
