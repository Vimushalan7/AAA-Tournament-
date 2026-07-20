import User from '../models/User.js';
import Tournament from '../models/Tournament.js';
import TournamentParticipant from '../models/TournamentParticipant.js';
import Room from '../models/Room.js';
import MatchResult from '../models/MatchResult.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';
import BannedUser from '../models/BannedUser.js';
import Notification from '../models/Notification.js';
import AdminLog from '../models/AdminLog.js';
import mongoose from 'mongoose';
import sendEmail from '../utils/sendEmail.js';

// Helper to log admin actions
const logAdminAction = async (adminId, action, targetId, details, req) => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    await AdminLog.create({
      adminId,
      action,
      targetId: String(targetId),
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

/**
 * @desc    Get dashboard metrics & analytics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMatches = await Tournament.countDocuments();
    const activeTournaments = await Tournament.countDocuments({ status: 'live' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    // Financial queries
    const deposits = await Transaction.find({ type: 'deposit', status: 'success' });
    const totalRevenue = deposits.reduce((acc, curr) => acc + curr.amount, 0);

    const withdrawals = await Transaction.find({ type: 'withdrawal', status: 'success' });
    const totalPayouts = withdrawals.reduce((acc, curr) => acc + curr.amount, 0);

    // Today's collections
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayDeposits = await Transaction.find({
      type: 'deposit',
      status: 'success',
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    const todayCollection = todayDeposits.reduce((acc, curr) => acc + curr.amount, 0);

    const todayWithdrawals = await Transaction.find({
      type: 'withdrawal',
      status: 'success',
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    const todayPayout = todayWithdrawals.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      totalUsers,
      totalRevenue,
      totalMatches,
      activeTournaments,
      pendingWithdrawals,
      todayCollection,
      todayPayout,
      totalPayouts
    });
  } catch (error) {
    console.error('Stats fetching error:', error);
    res.status(500).json({ message: 'Error loading dashboard statistics' });
  }
};

/**
 * @desc    Create Tournament
 * @route   POST /api/admin/tournaments
 * @access  Private/Admin
 */
export const createTournament = async (req, res) => {
  try {
    const { title, matchType, gameMode, map, entryFee, prizePool, prizePoolDetails, matchTime, totalSlots, description } = req.body;

    if (!title || !gameMode || !matchTime) {
      return res.status(400).json({ message: 'Title, Game Mode, and Match Time are required' });
    }

    const tournament = await Tournament.create({
      title,
      matchType: matchType || 'Battle Royale',
      gameMode,
      map: map || 'Bermuda',
      entryFee: Number(entryFee || 0),
      prizePool: Number(prizePool || 0),
      prizePoolDetails: prizePoolDetails || { perKill: 0, rank1: 0, rank2: 0, rank3: 0 },
      matchTime: new Date(matchTime),
      totalSlots: Number(totalSlots || 48),
      joinedSlots: 0,
      description: description || '',
      status: 'upcoming'
    });

    await logAdminAction(req.user._id, 'CREATE_TOURNAMENT', tournament._id, `Created tournament: "${title}"`, req);

    res.status(201).json(tournament);
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ message: 'Error creating tournament', error: error.message });
  }
};

/**
 * @desc    Edit Tournament
 * @route   PUT /api/admin/tournaments/:id
 * @access  Private/Admin
 */
export const editTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const { title, matchType, gameMode, map, entryFee, prizePool, prizePoolDetails, matchTime, totalSlots, status, description } = req.body;

    tournament.title = title || tournament.title;
    if (matchType) tournament.matchType = matchType;
    tournament.gameMode = gameMode || tournament.gameMode;
    tournament.map = map || tournament.map;
    tournament.entryFee = entryFee !== undefined ? Number(entryFee) : tournament.entryFee;
    tournament.prizePool = prizePool !== undefined ? Number(prizePool) : tournament.prizePool;
    tournament.prizePoolDetails = prizePoolDetails || tournament.prizePoolDetails;
    tournament.matchTime = matchTime ? new Date(matchTime) : tournament.matchTime;
    tournament.totalSlots = totalSlots !== undefined ? Number(totalSlots) : tournament.totalSlots;
    tournament.status = status || tournament.status;
    if (description !== undefined) tournament.description = description;

    const updated = await tournament.save();

    await logAdminAction(req.user._id, 'EDIT_TOURNAMENT', updated._id, `Edited tournament fields`, req);

    res.json(updated);
  } catch (error) {
    console.error('Edit tournament error:', error);
    res.status(500).json({ message: 'Error updating tournament' });
  }
};

/**
 * @desc    Cancel Tournament & Refund entries
 * @route   POST /api/admin/tournaments/:id/cancel
 * @access  Private/Admin
 */
export const cancelTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status === 'cancelled') {
      return res.status(400).json({ message: 'Tournament already cancelled' });
    }

    // Mark status
    tournament.status = 'cancelled';
    await tournament.save();

    // Fetch participants to refund
    const participants = await TournamentParticipant.find({
      tournamentId: tournament._id,
      status: 'joined'
    });

    // Refund entry fees
    if (tournament.entryFee > 0) {
      for (const participant of participants) {
        const user = await User.findById(participant.userId);
        if (user) {
          user.walletBalance += tournament.entryFee;
          await user.save();

          // Transaction log
          await Transaction.create([{
            userId: user._id,
            type: 'refund',
            amount: tournament.entryFee,
            status: 'success',
            paymentMethod: 'Wallet',
            referenceId: tournament._id
          }]);

          // Notification
          await Notification.create([{
            userId: user._id,
            title: 'Tournament Cancelled - Refunded',
            message: `"${tournament.title}" was cancelled by admin. Entry fee of ₹${tournament.entryFee} has been refunded to your wallet.`,
            type: 'system'
          }]);
        }
      }
    } else {
      // Free tournament cancellation notices
      for (const participant of participants) {
        await Notification.create([{
          userId: participant.userId,
          title: 'Tournament Cancelled',
          message: `"${tournament.title}" was cancelled by admin.`,
          type: 'system'
        }]);
      }
    }

    await logAdminAction(req.user._id, 'CANCEL_TOURNAMENT', tournament._id, `Cancelled tournament and refunded ${participants.length} players.`, req);

    res.json({ message: 'Tournament cancelled and refunds processed successfully' });
  } catch (error) {
    console.error('Cancel tournament error:', error);
    res.status(500).json({ message: 'Error cancelling tournament', error: error.message });
  }
};

/**
 * @desc    Delete Tournament
 * @route   DELETE /api/admin/tournaments/:id
 * @access  Private/Admin
 */
export const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if it has participants
    const hasParticipants = await TournamentParticipant.exists({ tournamentId: tournament._id });
    if (hasParticipants && tournament.status === 'upcoming') {
      return res.status(400).json({ message: 'Cannot delete tournament with active participants. Cancel it instead to refund players.' });
    }

    await Tournament.findByIdAndDelete(req.params.id);
    // Cleanup related room and participants if any
    await Room.deleteOne({ tournamentId: tournament._id });
    await TournamentParticipant.deleteMany({ tournamentId: tournament._id });

    await logAdminAction(req.user._id, 'DELETE_TOURNAMENT', tournament._id, `Deleted tournament from DB`, req);

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tournament' });
  }
};

/**
 * @desc    Create/Update custom lobby details
 * @route   POST /api/admin/rooms
 * @access  Private/Admin
 */
export const updateRoomDetails = async (req, res) => {
  try {
    const { tournamentId, roomId, password } = req.body;

    if (!tournamentId || !roomId || !password) {
      return res.status(400).json({ message: 'Missing tournamentId, roomId, or password' });
    }

    let room = await Room.findOne({ tournamentId });
    if (room) {
      room.roomId = roomId;
      room.password = password;
      room.status = 'pending';
      await room.save();
    } else {
      room = await Room.create({
        tournamentId,
        roomId,
        password,
        status: 'pending'
      });
    }

    res.json({ message: 'Room credentials updated. Send details to publish to players.', room });
  } catch (error) {
    res.status(500).json({ message: 'Error updating lobby details' });
  }
};

/**
 * @desc    Send Room details to players
 * @route   POST /api/admin/rooms/:tournamentId/send
 * @access  Private/Admin
 */
export const sendRoomDetailsToPlayers = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const room = await Room.findOne({ tournamentId });
    if (!room) {
      return res.status(404).json({ message: 'Room credentials not found. Set them first.' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Set sentToPlayers = true, status = active
    room.sentToPlayers = true;
    room.status = 'active';
    await room.save();

    // Update match status to live
    tournament.status = 'live';
    await tournament.save();

    // Fetch players
    const participants = await TournamentParticipant.find({ tournamentId, status: 'joined' }).populate('userId', 'email name');

    // Create room notifications for each participant
    for (const participant of participants) {
      const user = participant.userId;
      const userId = user?._id || participant.userId;
      
      await Notification.create([{
        userId: userId,
        title: 'Match Room Credentials Available!',
        message: `Lobby details for "${tournament.title}" are ready. Room ID: ${room.roomId} | Password: ${room.password}. Join quickly.`,
        type: 'room_details'
      }]);

      if (user && user.email) {
        await sendEmail({
          email: user.email,
          subject: `Room Details: ${tournament.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #FF6B00;">Match Room Credentials</h2>
              <p>Hi ${user.name},</p>
              <p>The lobby details for <strong>${tournament.title}</strong> are now available!</p>
              <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #FF6B00; margin: 20px 0;">
                <p style="margin: 5px 0; font-size: 16px;"><strong>Room ID:</strong> ${room.roomId}</p>
                <p style="margin: 5px 0; font-size: 16px;"><strong>Password:</strong> ${room.password}</p>
              </div>
              <p>Please open the game and join the custom room immediately. The match will start soon!</p>
              <p>Good luck!</p>
            </div>
          `
        });
      }
    }

    await logAdminAction(req.user._id, 'SEND_ROOM_DETAILS', tournamentId, `Dispatched Room credentials to ${participants.length} players. Set tournament to LIVE.`, req);

    res.json({ message: 'Credentials dispatched successfully and tournament set to LIVE' });
  } catch (error) {
    console.error('Error dispatching room details:', error);
    res.status(500).json({ message: 'Error dispatching room details', error: error.message });
  }
};

/**
 * @desc    Get all participants of a specific tournament
 * @route   GET /api/admin/tournaments/:id/participants
 * @access  Private/Admin
 */
export const getTournamentParticipants = async (req, res) => {
  try {
    const participants = await TournamentParticipant.find({ tournamentId: req.params.id })
      .populate('userId', 'name mobile')
      .sort({ createdAt: -1 });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tournament participants' });
  }
};

/**
 * @desc    Search and view all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: 'user' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { freeFireUid: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error loading user directories' });
  }
};

/**
 * @desc    Get specific user profile with all match and transaction logs
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
    const matches = await TournamentParticipant.find({ userId: user._id })
      .populate('tournamentId')
      .sort({ createdAt: -1 });

    res.json({
      user,
      transactions,
      matches
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading profile logs' });
  }
};

/**
 * @desc    Ban User (Temp or Perm)
 * @route   POST /api/admin/users/:id/ban
 * @access  Private/Admin
 */
export const banUser = async (req, res) => {
  try {
    const { banType, reason, durationDays } = req.body; // banType: 'temporary' or 'permanent'
    const userId = req.params.id;

    if (!banType || !reason) {
      return res.status(400).json({ message: 'Ban type and reason are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let bannedUntil = null;
    if (banType === 'temporary') {
      const days = Number(durationDays || 3);
      bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + days);
    }

    // Update user status
    user.status = banType === 'temporary' ? 'temp-banned' : 'perm-banned';
    user.banDetails = { reason, bannedUntil };
    await user.save();

    // Write to BannedUser collection for absolute locking of values (Anti-Cheat)
    await BannedUser.create([{
      userId: user._id,
      mobile: user.mobile,
      freeFireUid: user.freeFireUid || null,
      deviceId: user.deviceId || null,
      banType,
      reason,
      bannedUntil,
      adminId: req.user._id
    }]);

    // Create global admin log
    await logAdminAction(req.user._id, 'BAN_USER', user._id, `Banned user ${user.name} (${banType}). Reason: ${reason}`, req);

    res.json({ message: `User banned successfully (${banType})`, user });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Error banning user', error: error.message });
  }
};

/**
 * @desc    Unban User
 * @route   POST /api/admin/users/:id/unban
 * @access  Private/Admin
 */
export const unbanUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    user.banDetails = { reason: '', bannedUntil: null };
    await user.save();

    // Remove from locked banned lists
    await BannedUser.deleteMany({ userId: user._id });

    await logAdminAction(req.user._id, 'UNBAN_USER', user._id, `Lifted ban on user: ${user.name}`, req);

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error unbanning user' });
  }
};

/**
 * @desc    Get withdrawals list
 * @route   GET /api/admin/withdrawals
 * @access  Private/Admin
 */
export const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'name mobile email walletBalance')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Error loading payout directory' });
  }
};

/**
 * @desc    Process Payout (Approve/Reject)
 * @route   POST /api/admin/withdrawals/:id/process
 * @access  Private/Admin
 */
export const processWithdrawal = async (req, res) => {
  try {
    const { status, remarks } = req.body; // status: 'approved' or 'rejected'
    const withdrawalId = req.params.id;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (approved/rejected) required' });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal request already processed' });
    }

    const user = await User.findById(withdrawal.userId);
    const relatedTx = await Transaction.findOne({ referenceId: withdrawal._id });

    if (status === 'approved') {
      withdrawal.status = 'approved';
      withdrawal.remarks = remarks || 'Approved by Admin';
      withdrawal.completedAt = new Date();
      await withdrawal.save();

      if (relatedTx) {
        relatedTx.status = 'success';
        await relatedTx.save();
      }

      // Notification
      await Notification.create([{
        userId: withdrawal.userId,
        title: 'Withdrawal Completed',
        message: `Your withdrawal of ₹${withdrawal.amount} has been successfully processed to UPI ID: ${withdrawal.upiId}`,
        type: 'withdrawal'
      }]);

      await logAdminAction(req.user._id, 'APPROVE_WITHDRAWAL', withdrawal._id, `Approved payout of ₹${withdrawal.amount} to user: ${user?.name}`, req);
    } else {
      // Rejected: return money back to wallet
      withdrawal.status = 'rejected';
      withdrawal.remarks = remarks || 'Rejected by Admin';
      await withdrawal.save();

      if (relatedTx) {
        relatedTx.status = 'failed';
        await relatedTx.save();
      }

      if (user) {
        user.walletBalance += withdrawal.amount;
        await user.save();

        // Add refund log
        await Transaction.create([{
          userId: user._id,
          type: 'refund',
          amount: withdrawal.amount,
          status: 'success',
          paymentMethod: 'Wallet',
          referenceId: withdrawal._id
        }]);

        // Notification
        await Notification.create([{
          userId: user._id,
          title: 'Withdrawal Rejected',
          message: `Your withdrawal of ₹${withdrawal.amount} was rejected. Money refunded to wallet. Reason: ${withdrawal.remarks}`,
          type: 'withdrawal'
        }]);
      }

      await logAdminAction(req.user._id, 'REJECT_WITHDRAWAL', withdrawal._id, `Rejected withdrawal of ₹${withdrawal.amount} for user: ${user?.name}. Reason: ${remarks}`, req);
    }

    res.json({ message: `Withdrawal request processed: ${status}`, withdrawal });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ message: 'Error processing withdrawal request', error: error.message });
  }
};

/**
 * @desc    Get match result proof submissions
 * @route   GET /api/admin/results
 * @access  Private/Admin
 */
export const getMatchResults = async (req, res) => {
  try {
    const results = await MatchResult.find()
      .populate('userId', 'name mobile freeFireUid')
      .populate('tournamentId', 'title map matchTime status')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error loading match proof submissions' });
  }
};

/**
 * @desc    Approve/Reject Match Result & Distribute Prize Pool (Kill count + placement multipliers)
 * @route   POST /api/admin/results/:id/verify
 * @access  Private/Admin
 */
export const processMatchResult = async (req, res) => {
  try {
    const { status, kills, rank, adminRemarks } = req.body;
    const resultId = req.params.id;

    if (!status || !['approved', 'rejected', 'hold'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (approved/rejected/hold) required' });
    }

    const result = await MatchResult.findById(resultId);
    if (!result) {
      return res.status(404).json({ message: 'Submission record not found' });
    }

    if (result.status !== 'pending') {
      return res.status(400).json({ message: 'Result already processed' });
    }

    const tournament = await Tournament.findById(result.tournamentId);
    const participant = await TournamentParticipant.findOne({
      tournamentId: result.tournamentId,
      userId: result.userId
    });

    if (!participant) {
      return res.status(404).json({ message: 'Tournament participant not found' });
    }

    // Save result status
    result.status = status;
    result.adminRemarks = adminRemarks || 'Processed by Admin';
    result.verifiedBy = req.user._id;
    await result.save();

    if (status === 'approved') {
      const assignedKills = Number(kills !== undefined ? kills : result.submittedKills || 0);
      const assignedRank = Number(rank !== undefined ? rank : result.submittedRank || 0);

      // Save credentials into participant profile
      participant.kills = assignedKills;
      participant.rank = assignedRank;

      // Prize Distribution
      const details = tournament.prizePoolDetails || { perKill: 0, rank1: 0, rank2: 0, rank3: 0 };
      const killReward = assignedKills * (details.perKill || 0);
      let placementReward = 0;

      if (assignedRank === 1) placementReward = details.rank1 || 0;
      else if (assignedRank === 2) placementReward = details.rank2 || 0;
      else if (assignedRank === 3) placementReward = details.rank3 || 0;

      const totalWin = killReward + placementReward;

      if (totalWin > 0) {
        participant.prizeWon = totalWin;
        participant.prizeClaimed = true;
        await participant.save();

        // Credit Wallet
        const user = await User.findById(result.userId);
        if (user) {
          user.walletBalance += totalWin;
          await user.save();

          // Transaction log
          await Transaction.create([{
            userId: user._id,
            type: 'winning',
            amount: totalWin,
            status: 'success',
            paymentMethod: 'Winnings',
            referenceId: tournament._id
          }]);

          // Notification
          await Notification.create([{
            userId: user._id,
            title: 'Winnings Credited!',
            message: `Congratulations! You won ₹${totalWin} (Rank: #${assignedRank}, Kills: ${assignedKills}) in match "${tournament.title}". Amount added to wallet.`,
            type: 'winning'
          }]);
        }
      } else {
        await participant.save();
      }

      await logAdminAction(req.user._id, 'VERIFY_RESULT', result._id, `Approved results for user ${result.userId}: Rank #${assignedRank}, Kills: ${assignedKills}. Prize Credited: ₹${totalWin}`, req);
    } else if (status === 'rejected') {
      // Result rejected
      // Notification
      await Notification.create([{
        userId: result.userId,
        title: 'Match Proof Rejected',
        message: `Your submitted proof for match "${tournament?.title}" was rejected. Remarks: ${result.adminRemarks}`,
        type: 'system'
      }]);

      await logAdminAction(req.user._id, 'REJECT_RESULT', result._id, `Rejected match results for user ${result.userId}. Remarks: ${adminRemarks}`, req);
    } else if (status === 'hold') {
      // Result put on hold
      await Notification.create([{
        userId: result.userId,
        title: 'Match Proof On Hold',
        message: `Your submitted proof for match "${tournament?.title}" is currently on hold. Remarks: ${result.adminRemarks}`,
        type: 'system'
      }]);

      await logAdminAction(req.user._id, 'HOLD_RESULT', result._id, `Put match results on hold for user ${result.userId}. Remarks: ${adminRemarks}`, req);
    }

    res.json({ message: `Proof status processed: ${status}`, result });
  } catch (error) {
    console.error('Process match result error:', error);
    res.status(500).json({ message: 'Error processing result verification', error: error.message });
  }
};

/**
 * @desc    Manually enter Match Result (Bypass Proof) & Distribute Prize Pool
 * @route   POST /api/admin/results/manual
 * @access  Private/Admin
 */
export const manualMatchResult = async (req, res) => {
  try {
    const { tournamentId, userId, kills, rank, adminRemarks } = req.body;

    if (!tournamentId || !userId || kills === undefined || rank === undefined) {
      return res.status(400).json({ message: 'Missing required manual entry fields' });
    }

    const assignedKills = Number(kills);
    const assignedRank = Number(rank);

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const participant = await TournamentParticipant.findOne({ tournamentId, userId });
    if (!participant) return res.status(404).json({ message: 'User is not registered in this tournament' });

    // Check if result already exists
    let result = await MatchResult.findOne({ tournamentId, userId });
    
    if (result) {
      if (result.status === 'approved') {
        return res.status(400).json({ message: 'This user already has an approved result' });
      }
      // Update existing pending/rejected result
      result.status = 'approved';
      result.submittedKills = assignedKills;
      result.submittedRank = assignedRank;
      result.adminRemarks = adminRemarks || 'Manual Entry - Verified by Admin';
      result.verifiedBy = req.user._id;
      await result.save();
    } else {
      // Create new manual result
      result = await MatchResult.create({
        tournamentId,
        userId,
        screenshotUrl: 'Manual Entry',
        submittedKills: assignedKills,
        submittedRank: assignedRank,
        status: 'approved',
        adminRemarks: adminRemarks || 'Manual Entry - Verified by Admin',
        verifiedBy: req.user._id
      });
    }

    // Save credentials into participant profile
    participant.kills = assignedKills;
    participant.rank = assignedRank;

    // Prize Distribution
    const details = tournament.prizePoolDetails || { perKill: 0, rank1: 0, rank2: 0, rank3: 0 };
    const killReward = assignedKills * (details.perKill || 0);
    let placementReward = 0;

    if (assignedRank === 1) placementReward = details.rank1 || 0;
    else if (assignedRank === 2) placementReward = details.rank2 || 0;
    else if (assignedRank === 3) placementReward = details.rank3 || 0;

    const totalWin = killReward + placementReward;

    if (totalWin > 0) {
      participant.prizeWon = totalWin;
      participant.prizeClaimed = true;
      await participant.save();

      // Credit Wallet
      const user = await User.findById(userId);
      if (user) {
        user.walletBalance += totalWin;
        await user.save();

        // Transaction log
        await Transaction.create([{
          userId: user._id,
          type: 'winning',
          amount: totalWin,
          status: 'success',
          paymentMethod: 'Winnings',
          referenceId: tournament._id
        }]);

        // Notification
        await Notification.create([{
          userId: user._id,
          title: 'Winnings Credited (Manual Audit)!',
          message: `Congratulations! You won ₹${totalWin} (Rank: #${assignedRank}, Kills: ${assignedKills}) in match "${tournament.title}". Amount added to wallet.`,
          type: 'winning'
        }]);
      }
    } else {
      await participant.save();
    }

    await logAdminAction(req.user._id, 'VERIFY_RESULT', result._id, `Manual Entry for user ${userId}: Rank #${assignedRank}, Kills: ${assignedKills}. Prize Credited: ₹${totalWin}`, req);

    res.json({ message: 'Manual result submitted and processed', result });
  } catch (error) {
    console.error('Manual match result error:', error);
    res.status(500).json({ message: 'Error processing manual result', error: error.message });
  }
};

/**
 * @desc    Edit a previously processed Match Result
 * @route   POST /api/admin/results/:id/edit
 * @access  Private/Admin
 */
export const editMatchResult = async (req, res) => {
  try {
    const { status, kills, rank, adminRemarks } = req.body;
    const resultId = req.params.id;

    if (!status || !['approved', 'rejected', 'hold'].includes(status)) {
      return res.status(400).json({ message: 'Valid status required' });
    }

    const result = await MatchResult.findById(resultId);
    if (!result) return res.status(404).json({ message: 'Result not found' });

    if (result.status === 'pending') {
      return res.status(400).json({ message: 'Result is still pending. Use verify instead.' });
    }

    const tournament = await Tournament.findById(result.tournamentId);
    const participant = await TournamentParticipant.findOne({
      tournamentId: result.tournamentId,
      userId: result.userId
    });

    if (!participant || !tournament) {
      return res.status(404).json({ message: 'Participant or tournament not found' });
    }

    // Calculate Old Prize
    const details = tournament.prizePoolDetails || { perKill: 0, rank1: 0, rank2: 0, rank3: 0 };
    let oldPrize = 0;
    if (result.status === 'approved') {
      const oldKills = participant.kills || 0;
      const oldRank = participant.rank || 0;
      const oldKillReward = oldKills * (details.perKill || 0);
      let oldPlacementReward = 0;
      if (oldRank === 1) oldPlacementReward = details.rank1 || 0;
      else if (oldRank === 2) oldPlacementReward = details.rank2 || 0;
      else if (oldRank === 3) oldPlacementReward = details.rank3 || 0;
      oldPrize = oldKillReward + oldPlacementReward;
    }

    // Calculate New Prize
    let newPrize = 0;
    const newKills = Number(kills !== undefined ? kills : result.submittedKills || 0);
    const newRank = Number(rank !== undefined ? rank : result.submittedRank || 0);

    if (status === 'approved') {
      const newKillReward = newKills * (details.perKill || 0);
      let newPlacementReward = 0;
      if (newRank === 1) newPlacementReward = details.rank1 || 0;
      else if (newRank === 2) newPlacementReward = details.rank2 || 0;
      else if (newRank === 3) newPlacementReward = details.rank3 || 0;
      newPrize = newKillReward + newPlacementReward;
    }

    const delta = newPrize - oldPrize;

    // Update Result & Participant
    result.status = status;
    result.submittedKills = newKills;
    result.submittedRank = newRank;
    result.adminRemarks = adminRemarks || 'Edited by Admin';
    result.verifiedBy = req.user._id;
    await result.save();

    if (status === 'approved') {
      participant.kills = newKills;
      participant.rank = newRank;
      participant.prizeWon = newPrize;
      participant.prizeClaimed = newPrize > 0;
    } else {
      participant.kills = 0;
      participant.rank = 0;
      participant.prizeWon = 0;
      participant.prizeClaimed = false;
    }
    await participant.save();

    // Adjust Wallet if delta exists
    if (delta !== 0) {
      const user = await User.findById(result.userId);
      if (user) {
        user.walletBalance += delta;
        await user.save();

        await Transaction.create([{
          userId: user._id,
          type: delta > 0 ? 'winning' : 'withdrawal',
          amount: Math.abs(delta),
          status: 'success',
          paymentMethod: 'Adjustment',
          referenceId: tournament._id
        }]);

        const actionText = delta > 0 ? `credited ₹${delta}` : `deducted ₹${Math.abs(delta)}`;
        await Notification.create([{
          userId: user._id,
          title: 'Match Winnings Adjusted',
          message: `An admin has revised your results for "${tournament.title}". Your wallet was ${actionText} to correct the payout.`,
          type: 'system'
        }]);
      }
    }

    await logAdminAction(req.user._id, 'EDIT_RESULT', result._id, `Adjusted result for user ${result.userId}. Delta: ₹${delta}. New Status: ${status}`, req);

    res.json({ message: `Result adjusted. Delta applied: ₹${delta}`, result });
  } catch (error) {
    console.error('Edit match result error:', error);
    res.status(500).json({ message: 'Error editing result', error: error.message });
  }
};

/**
 * @desc    Broadcast global notification / match notices / maintenance alert

 * @route   POST /api/admin/notifications
 * @access  Private/Admin
 */
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, targetType, tournamentId, targetUserEmail, isPoll, pollOptions } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    let formattedPollOptions = [];
    if (isPoll && pollOptions && Array.isArray(pollOptions)) {
      formattedPollOptions = pollOptions.map(opt => ({ text: opt, votes: 0, voters: [] }));
    }

    if (targetType === 'individual' && targetUserEmail) {
      const targetUser = await User.findOne({ email: targetUserEmail });
      if (!targetUser) {
        return res.status(404).json({ message: 'User with this email not found' });
      }
      await Notification.create({
        userId: targetUser._id,
        title,
        message,
        type: 'individual',
        isPoll: isPoll || false,
        pollOptions: formattedPollOptions
      });
      res.json({ message: 'Notification sent to individual user successfully.' });
    } else if (targetType === 'tournament' && tournamentId) {
      // Send only to participants
      const participants = await TournamentParticipant.find({ tournamentId, status: 'joined' });
      const notices = participants.map(p => ({
        userId: p.userId,
        title,
        message,
        type: 'match_starting',
        isPoll: isPoll || false,
        pollOptions: formattedPollOptions
      }));

      if (notices.length > 0) {
        await Notification.insertMany(notices);
      }
      res.json({ message: `Dispatched notification to ${notices.length} tournament players.` });
    } else {
      // Broadcast / global maintenance warning (userId null)
      await Notification.create({
        userId: null,
        title,
        message,
        type: targetType === 'maintenance' ? 'system' : 'global',
        isPoll: isPoll || false,
        pollOptions: formattedPollOptions
      });
      res.json({ message: 'Global broadcast dispatched successfully' });
    }

    await logAdminAction(req.user._id, 'BROADCAST_NOTIFICATION', '', `Sent notification: "${title}" (Target: ${targetType})`, req);
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ message: 'Error dispatching notifications' });
  }
};

/**
 * @desc    Fetch all notifications for admin view
 * @route   GET /api/admin/notifications
 * @access  Private/Admin
 */
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'name mobile freeFireUid')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

/**
 * @desc    Delete any notification
 * @route   DELETE /api/admin/notifications/:id
 * @access  Private/Admin
 */
export const deleteNotificationByAdmin = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await Notification.findByIdAndDelete(req.params.id);
    await logAdminAction(req.user._id, 'DELETE_NOTIFICATION', req.params.id, `Deleted notification titled: ${notification.title}`, req);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

/**
 * @desc    Delete all notifications
 * @route   DELETE /api/admin/notifications/all
 * @access  Private/Admin
 */
export const deleteAllNotificationsByAdmin = async (req, res) => {
  try {
    await Notification.deleteMany({});
    await logAdminAction(req.user._id, 'DELETE_ALL_NOTIFICATIONS', null, 'Deleted all notifications from the system', req);
    res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all notifications' });
  }
};

/**
 * @desc    Fetch audit action logs
 * @route   GET /api/admin/logs
 * @access  Private/Admin
 */
export const getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate('adminId', 'name mobile')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error loading admin logs' });
  }
};
