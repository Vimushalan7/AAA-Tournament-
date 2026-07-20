import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserTransactions,
  getUserNotifications,
  markNotificationAsRead,
  deleteUserNotification,
  deleteAllUserNotifications,
  submitMatchResult,
  getUserMatchHistory,
  getUserMatchResults,
  verifySocial,
  voteOnNotification,
  acceptRules
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkBanned } from '../middlewares/banCheckMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(checkBanned);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.put('/accept-rules', acceptRules);

router.post('/social/verify', verifySocial);

router.get('/transactions', getUserTransactions);
router.get('/notifications', getUserNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);
router.post('/notifications/:id/vote', voteOnNotification);
router.delete('/notifications/all', deleteAllUserNotifications);
router.delete('/notifications/:id', deleteUserNotification);
router.route('/results')
  .get(getUserMatchResults)
  .post(submitMatchResult);
router.get('/matches', getUserMatchHistory);

export default router;
