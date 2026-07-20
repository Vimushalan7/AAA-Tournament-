import mongoose from 'mongoose';

const bannedUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  mobile: {
    type: String,
    sparse: true,
  },
  freeFireUid: {
    type: String,
    sparse: true,
  },
  deviceId: {
    type: String,
    sparse: true,
  },
  banType: {
    type: String,
    enum: ['temporary', 'permanent'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  bannedUntil: {
    type: Date,
    default: null, // null for permanent
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});


const BannedUser = mongoose.model('BannedUser', bannedUserSchema);
export default BannedUser;
