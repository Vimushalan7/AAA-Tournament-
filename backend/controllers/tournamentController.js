import Tournament from '../models/Tournament.js';
import TournamentParticipant from '../models/TournamentParticipant.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Room from '../models/Room.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Get all tournaments
 * @route   GET /api/tournaments
 * @access  Public
 */
export const getTournaments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    const tournaments = await Tournament.find(filter).sort({ matchTime: 1 });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Server error loading tournaments' });
  }
};

/**
 * @desc    Get tournament by ID & active registration state
 * @route   GET /api/tournaments/:id
 * @access  Public/Optional Private
 */
export const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    let isRegistered = false;
    let participantDetails = null;
    let roomDetails = null;

    // Fetch all participants for this tournament
    const participants = await TournamentParticipant.find({ tournamentId: tournament._id })
      .populate('userId', 'name profilePic')
      .select('ffName freeFireUid status kills rank prizeWon createdAt teamMembers')
      .sort({ createdAt: 1 });

    // If request contains authorization header (user is logged in)
    if (req.query.userId) {
      const participant = participants.find(p => p.userId && p.userId._id.toString() === req.query.userId.toString());

      if (participant) {
        isRegistered = true;
        participantDetails = participant;

        // Fetch room info if registered and match is upcoming/live
        if (tournament.status === 'upcoming' || tournament.status === 'live') {
          const room = await Room.findOne({ tournamentId: tournament._id, sentToPlayers: true });
          if (room) {
            roomDetails = {
              roomId: room.roomId,
              password: room.password,
              status: room.status
            };
          }
        }
      }
    }

    res.json({
      tournament,
      isRegistered,
      participantDetails,
      roomDetails,
      participants
    });
  } catch (error) {
    console.error('Error fetching tournament details:', error);
    res.status(500).json({ message: 'Server error loading tournament details' });
  }
};

/**
 * @desc    Join a tournament
 * @route   POST /api/tournaments/:id/join
 * @access  Private
 */
export const joinTournament = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const userId = req.user._id;
    const { email, ffName, freeFireUid, teamMembers } = req.body;

    // Check required fields
    if (!freeFireUid) {
      return res.status(400).json({ message: 'Free Fire UID is required to join. Please complete your profile.' });
    }

    // Load user
    const user = await User.findById(userId);

    // Enforce Social Verifications
    if (!user.subscribedYoutube || !user.followedWhatsapp) {
      return res.status(403).json({ 
        message: 'You must subscribe to our YouTube channel and follow our WhatsApp channel before joining tournaments. Please complete this in your Profile.',
        requiresSocialVerification: true
      });
    }

    // Find tournament
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Matches can only be joined while status is upcoming' });
    }

    // Team size = leader (1) + additional squad members
    const incomingTeamSize = (teamMembers && teamMembers.length > 0) ? teamMembers.length + 1 : 1;
    const remainingSlots = tournament.totalSlots - tournament.joinedSlots;
    if (remainingSlots < incomingTeamSize) {
      return res.status(400).json({ message: `Not enough slots available. Only ${remainingSlots} slot(s) remaining.` });
    }

    // Check if user is already a participant
    const alreadyJoined = await TournamentParticipant.findOne({
      tournamentId,
      userId
    });

    if (alreadyJoined) {
      return res.status(400).json({ message: 'You have already joined this tournament' });
    }

    // Check wallet balance
    if (user.walletBalance < tournament.entryFee) {
      return res.status(400).json({ message: 'Insufficient wallet balance. Please deposit funds.' });
    }

    // Process payments/deduction
    user.walletBalance -= tournament.entryFee;
    await user.save();

    // Create transaction log
    await Transaction.create({
      userId,
      type: 'entry_fee',
      amount: tournament.entryFee,
      status: 'success',
      paymentMethod: 'Wallet',
      referenceId: tournament._id
    });

    // Register participant
    await TournamentParticipant.create({
      tournamentId,
      userId,
      email: email || '',
      ffName: ffName || '',
      freeFireUid,
      teamMembers: teamMembers || [],
      status: 'joined'
    });

    // Increment slots by actual team size
    tournament.joinedSlots += incomingTeamSize;
    await tournament.save();

    // Create user notification
    await Notification.create({
      userId,
      title: 'Tournament Joined',
      message: `You successfully joined the tournament: "${tournament.title}". Entry fee of ₹${tournament.entryFee} deducted.`,
      type: 'system'
    });

    res.status(200).json({
      message: 'Successfully registered for tournament',
      walletBalance: user.walletBalance,
      joinedSlots: tournament.joinedSlots
    });
  } catch (error) {
    console.error('Error joining tournament:', error);
    res.status(500).json({ message: 'Server error joining tournament', error: error.message });
  }
};
