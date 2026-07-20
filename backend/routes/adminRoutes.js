import express from 'express';
import {
  getDashboardStats,
  createTournament,
  editTournament,
  cancelTournament,
  deleteTournament,
  updateRoomDetails,
  sendRoomDetailsToPlayers,
  getUsers,
  getTournamentParticipants,
  getUserById,
  banUser,
  unbanUser,
  getWithdrawals,
  processWithdrawal,
  getMatchResults,
  processMatchResult,
  editMatchResult,
  manualMatchResult,
  broadcastNotification,
  getAllNotifications,
  deleteNotificationByAdmin,
  deleteAllNotificationsByAdmin,
  getAdminLogs
} from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply admin protection to all routes
router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);

router.post('/tournaments', createTournament);
router.put('/tournaments/:id', editTournament);
router.post('/tournaments/:id/cancel', cancelTournament);
router.delete('/tournaments/:id', deleteTournament);

router.post('/rooms', updateRoomDetails);
router.post('/rooms/:tournamentId/send', sendRoomDetailsToPlayers);
router.get('/tournaments/:id/participants', getTournamentParticipants);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);

router.get('/withdrawals', getWithdrawals);
router.post('/withdrawals/:id/process', processWithdrawal);

router.get('/results', getMatchResults);
router.post('/results/manual', manualMatchResult);
router.post('/results/:id/verify', processMatchResult);
router.post('/results/:id/edit', editMatchResult);

router.route('/notifications')
  .get(getAllNotifications)
  .post(broadcastNotification);
router.delete('/notifications/all', deleteAllNotificationsByAdmin);
router.delete('/notifications/:id', deleteNotificationByAdmin);

router.get('/logs', getAdminLogs);

export default router;
