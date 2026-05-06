import express from 'express';
import { body, param } from 'express-validator';
import {
  addMember,
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject
} from '../controllers/project.controller.js';
import { adminOnly, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('members').optional().isArray().withMessage('Members must be an array')
];

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(adminOnly, projectValidation, validate, createProject);

router.route('/:id')
  .get(param('id').isMongoId().withMessage('Invalid project ID'), validate, getProject)
  .put(adminOnly, param('id').isMongoId(), projectValidation, validate, updateProject)
  .delete(adminOnly, param('id').isMongoId(), validate, deleteProject);

router.post(
  '/:id/members',
  adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('email').isEmail().withMessage('Valid member email is required')
  ],
  validate,
  addMember
);

export default router;
