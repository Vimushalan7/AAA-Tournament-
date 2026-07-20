import mongoose from 'mongoose';

const matchResultSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  screenshotUrl: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hold'],
    default: 'pending',
  },
  submittedKills: {
    type: Number,
    default: 0,
  },
  submittedRank: {
    type: Number,
    default: 0,
  },
  adminRemarks: {
    type: String,
    default: '',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// A user can submit one proof per tournament
matchResultSchema.index({ tournamentId: 1, userId: 1 }, { unique: true });

const MatchResult = mongoose.model('MatchResult', matchResultSchema);
export default MatchResult;
