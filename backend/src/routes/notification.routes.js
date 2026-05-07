import express from 'express';
import { param, query } from 'express-validator';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', query('limit').optional().isInt({ min: 1, max: 50 }), validate, getNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', param('id').isMongoId().withMessage('Invalid notification ID'), validate, markNotificationRead);

export default router;
