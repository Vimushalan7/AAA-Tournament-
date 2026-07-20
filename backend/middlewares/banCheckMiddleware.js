import User from '../models/User.js';
import BannedUser from '../models/BannedUser.js';

export const checkBanned = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next();
    }

    // Double check database status
    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check temp-ban expiration
    if (dbUser.status === 'temp-banned') {
      const isPast = dbUser.banDetails && dbUser.banDetails.bannedUntil && new Date() > new Date(dbUser.banDetails.bannedUntil);
      if (isPast) {
        // Automatically lift ban
        dbUser.status = 'active';
        dbUser.banDetails = { reason: '', bannedUntil: null };
        await dbUser.save();
      } else {
        return res.status(403).json({
          message: `Your account is temporarily banned. Reason: ${dbUser.banDetails.reason || 'Not specified'}. Ban lifts on: ${dbUser.banDetails.bannedUntil}`,
          status: dbUser.status,
          banDetails: dbUser.banDetails
        });
      }
    }

    if (dbUser.status === 'perm-banned') {
      return res.status(403).json({
        message: `Your account has been permanently banned. Reason: ${dbUser.banDetails.reason || 'Violating platform guidelines'}.`,
        status: dbUser.status,
        banDetails: dbUser.banDetails
      });
    }

    next();
  } catch (error) {
    console.error('Ban check middleware error:', error);
    res.status(500).json({ message: 'Internal server error during security checks' });
  }
};

// Check if credentials are on the ban list (for register, login, UID binding)
export const checkBannedCredentials = async (req, res, next) => {
  try {
    const { mobile, freeFireUid, deviceId } = req.body;

    const queries = [];
    if (mobile) queries.push({ mobile });
    if (freeFireUid) queries.push({ freeFireUid });
    if (deviceId) queries.push({ deviceId });

    if (queries.length === 0) {
      return next();
    }

    const isBanned = await BannedUser.findOne({
      $or: queries,
      $and: [
        {
          $or: [
            { banType: 'permanent' },
            { bannedUntil: { $gt: new Date() } }
          ]
        }
      ]
    });

    if (isBanned) {
      return res.status(403).json({
        message: `Action Blocked: This ${isBanned.mobile === mobile ? 'Mobile Number' : isBanned.freeFireUid === freeFireUid ? 'Free Fire UID' : 'Device ID'} is blocked due to policy violations. Reason: ${isBanned.reason}`,
        reason: isBanned.reason
      });
    }

    next();
  } catch (error) {
    console.error('Banned credentials check error:', error);
    next(); // don't block request if check fails due to db error, but log it
  }
};
