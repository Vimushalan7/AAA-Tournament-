import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls/omitted values
  },
  password: {
    type: String,
    required: false,
  },
  freeFireUid: {
    type: String,
    unique: true,
    sparse: true,
  },
  profilePic: {
    type: String,
    default: '',
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'temp-banned', 'perm-banned'],
    default: 'active',
  },
  banDetails: {
    reason: { type: String, default: '' },
    bannedUntil: { type: Date, default: null },
  },
  deviceId: {
    type: String,
    default: '',
  },
  subscribedYoutube: {
    type: Boolean,
    default: false,
  },
  followedWhatsapp: {
    type: Boolean,
    default: false,
  },
  rulesAccepted: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
