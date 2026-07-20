import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc    Login user with email + password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'perm-banned') {
      return res.status(403).json({ message: 'Your account has been permanently banned.' });
    }

    if (user.status === 'temp-banned') {
      if (new Date() < new Date(user.banDetails?.bannedUntil)) {
        return res.status(403).json({
          message: `Your account is temporarily banned until ${new Date(user.banDetails.bannedUntil).toLocaleString()}. Reason: ${user.banDetails.reason || 'Violations'}`
        });
      } else {
        user.status = 'active';
        user.banDetails = { reason: '', bannedUntil: null };
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      walletBalance: user.walletBalance,
      freeFireUid: user.freeFireUid,
      profilePic: user.profilePic,
      subscribedYoutube: user.subscribedYoutube,
      followedWhatsapp: user.followedWhatsapp,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Register new user with email + password
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) {
      return res.status(400).json({ message: 'Mobile number is already registered' });
    }

    // Only vimushalan@gmail.com gets admin role
    const role = email === 'vimushalan@gmail.com' ? 'admin' : 'user';

    const user = await User.create({ name, email, password, mobile, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      walletBalance: user.walletBalance,
      subscribedYoutube: user.subscribedYoutube,
      followedWhatsapp: user.followedWhatsapp,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc    Google OAuth - create or find user by email
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, profilePic } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google
      const role = email === 'vimushalan@gmail.com' ? 'admin' : 'user';
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        mobile: `google_${googleId || Date.now()}`,
        role,
        status: 'active',
        profilePic: profilePic || '',
        walletBalance: 0,
      });
    }

    if (user.status === 'perm-banned') {
      return res.status(403).json({ message: 'Your account has been permanently banned.' });
    }

    if (user.status === 'temp-banned') {
      if (new Date() < new Date(user.banDetails?.bannedUntil)) {
        return res.status(403).json({
          message: `Your account is temporarily banned until ${new Date(user.banDetails.bannedUntil).toLocaleString()}. Reason: ${user.banDetails.reason || 'Violations'}`
        });
      } else {
        user.status = 'active';
        user.banDetails = { reason: '', bannedUntil: null };
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      walletBalance: user.walletBalance,
      freeFireUid: user.freeFireUid,
      profilePic: user.profilePic,
      subscribedYoutube: user.subscribedYoutube,
      followedWhatsapp: user.followedWhatsapp,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
};
