import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Ban check
    if (user.status === 'perm-banned') {
      return res.status(403).json({ message: 'Your account is permanently banned.' });
    }

    if (user.status === 'temp-banned') {
      if (new Date() < new Date(user.banDetails.bannedUntil)) {
        return res.status(403).json({
          message: `Your account is temporarily banned until ${user.banDetails.bannedUntil}.`
        });
      } else {
        user.status = 'active';
        user.banDetails = { reason: '', bannedUntil: null };
        await user.save();
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
