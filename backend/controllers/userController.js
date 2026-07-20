import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import MatchResult from '../models/MatchResult.js';
import TournamentParticipant from '../models/TournamentParticipant.js';
import BannedUser from '../models/BannedUser.js';

/**
 * @desc    Get user profile details
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

/**
 * @desc    Update profile fields
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { name, email, freeFireUid, profilePic } = req.body;

      if (freeFireUid && freeFireUid !== user.freeFireUid) {
        // Anti-Cheat Check: check if UID is banned
        const isUidBanned = await BannedUser.findOne({ freeFireUid, banType: 'permanent' });
        if (isUidBanned) {
          return res.status(400).json({ message: 'This Free Fire UID has been banned from this platform.' });
        }

        // Check if UID is already taken by another user
        const uidExists = await User.findOne({ freeFireUid, _id: { $ne: user._id } });
        if (uidExists) {
          return res.status(400).json({ message: 'Free Fire UID is already registered' });
        }
        user.freeFireUid = freeFireUid;
      }

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already registered' });
        }
        user.email = email;
      }

      user.name = name || user.name;
      user.profilePic = profilePic !== undefined ? profilePic : user.profilePic;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        mobile: updatedUser.mobile,
        email: updatedUser.email,
        freeFireUid: updatedUser.freeFireUid,
        profilePic: updatedUser.profilePic,
        walletBalance: updatedUser.walletBalance,
        role: updatedUser.role,
        status: updatedUser.status,
        subscribedYoutube: updatedUser.subscribedYoutube,
        followedWhatsapp: updatedUser.followedWhatsapp,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

/**
 * @desc    Verify social media subscription/follow
 * @route   POST /api/users/social/verify
 * @access  Private
 */
export const verifySocial = async (req, res) => {
  try {
    const { platform } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (platform === 'youtube') {
      user.subscribedYoutube = true;
    } else if (platform === 'whatsapp') {
      user.followedWhatsapp = true;
    } else {
      return res.status(400).json({ message: 'Invalid platform specified' });
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      mobile: updatedUser.mobile,
      email: updatedUser.email,
      freeFireUid: updatedUser.freeFireUid,
      profilePic: updatedUser.profilePic,
      walletBalance: updatedUser.walletBalance,
      role: updatedUser.role,
      status: updatedUser.status,
      subscribedYoutube: updatedUser.subscribedYoutube,
      followedWhatsapp: updatedUser.followedWhatsapp,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying social platform', error: error.message });
  }
};

/**
 * @desc    Get user's transactions
 * @route   GET /api/users/transactions
 * @access  Private
 */
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error loading transaction logs' });
  }
};

/**
 * @desc    Get notifications for user (User-specific + Global)
 * @route   GET /api/users/notifications
 * @access  Private
 */
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $and: [
        {
          $or: [
            { userId: req.user._id },
            { userId: null } // Global
          ]
        },
        { deletedBy: { $ne: req.user._id } }
      ]
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notification inbox' });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/users/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Security check: must belong to user or be a global notification
    if (notification.userId && notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    notification.read = true;
    await notification.save();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification' });
  }
};

/**
 * @desc    Delete or hide a notification
 * @route   DELETE /api/users/notifications/:id
 * @access  Private
 */
export const deleteUserNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId === null) {
      // It's a global notification, just hide it for this user
      if (!notification.deletedBy.includes(req.user._id)) {
        notification.deletedBy.push(req.user._id);
        await notification.save();
      }
      return res.json({ message: 'Notification hidden' });
    } else {
      // It's a personal notification, ensure they own it before deleting
      if (notification.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
      await Notification.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Notification deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

/**
 * @desc    Clear all notifications for user
 * @route   DELETE /api/users/notifications/all
 * @access  Private
 */
export const deleteAllUserNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    await Notification.updateMany(
      { userId: null, deletedBy: { $ne: req.user._id } },
      { $push: { deletedBy: req.user._id } }
    );
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing notifications' });
  }
};

/**
 * @desc    Vote on a notification poll
 * @route   POST /api/users/notifications/:id/vote
 * @access  Private
 */
export const voteOnNotification = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.isPoll || !notification.pollOptions || notification.pollOptions.length === 0) {
      return res.status(400).json({ message: 'This notification is not a poll' });
    }

    // Check if user already voted in any option
    const alreadyVoted = notification.pollOptions.some(opt => opt.voters.includes(req.user._id));
    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    if (optionIndex < 0 || optionIndex >= notification.pollOptions.length) {
      return res.status(400).json({ message: 'Invalid poll option' });
    }

    notification.pollOptions[optionIndex].votes += 1;
    notification.pollOptions[optionIndex].voters.push(req.user._id);

    await notification.save();

    res.json({ message: 'Vote submitted successfully', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting vote' });
  }
};

/**
 * @desc    Submit screenshot/proof of match result
 * @route   POST /api/users/results
 * @access  Private
 */
export const submitMatchResult = async (req, res) => {
  try {
    const { tournamentId, screenshotUrl, videoUrl, submittedKills, submittedRank } = req.body;

    if (!tournamentId || !screenshotUrl) {
      return res.status(400).json({ message: 'Please provide Tournament ID and Screenshot proof URL' });
    }

    // Verify user is a registered participant in this tournament
    const participant = await TournamentParticipant.findOne({
      tournamentId,
      userId: req.user._id
    });

    if (!participant) {
      return res.status(400).json({ message: 'You are not a registered participant in this tournament' });
    }

    // Check if result has already been submitted
    const existingResult = await MatchResult.findOne({
      tournamentId,
      userId: req.user._id
    });

    if (existingResult) {
      return res.status(400).json({ message: 'You have already submitted result proof for this match' });
    }

    const result = await MatchResult.create({
      tournamentId,
      userId: req.user._id,
      screenshotUrl,
      videoUrl: videoUrl || '',
      submittedKills: Number(submittedKills || 0),
      submittedRank: Number(submittedRank || 0),
      status: 'pending'
    });

    res.status(201).json({
      message: 'Match results submitted successfully for verification',
      result
    });
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ message: 'Server error submitting match proof', error: error.message });
  }
};

/**
 * @desc    Get user's match history
 * @route   GET /api/users/matches
 * @access  Private
 */
export const getUserMatchHistory = async (req, res) => {
  try {
    const history = await TournamentParticipant.find({ userId: req.user._id })
      .populate('tournamentId')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error loading match records' });
  }
};

/**
 * @desc    Accept tournament rules
 * @route   PUT /api/users/accept-rules
 * @access  Private
 */
export const acceptRules = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.rulesAccepted = true;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error accepting rules' });
  }
};

/**
 * @desc    Get user's submitted results
 * @route   GET /api/users/results
 * @access  Private
 */
export const getUserMatchResults = async (req, res) => {
  try {
    const results = await MatchResult.find({ userId: req.user._id })
      .populate('tournamentId', 'title map status matchTime')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error loading results proofs' });
  }
};
