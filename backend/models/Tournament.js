import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  matchType: {
    type: String,
    enum: ['Battle Royale', 'Clash Squad'],
    default: 'Battle Royale',
  },
  gameMode: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  map: {
    type: String,
    enum: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine'],
    default: 'Bermuda',
  },
  entryFee: {
    type: Number,
    required: true,
    default: 0,
  },
  prizePool: {
    type: Number,
    required: true,
    default: 0,
  },
  prizePoolDetails: {
    perKill: { type: Number, default: 0 },
    rank1: { type: Number, default: 0 },
    rank2: { type: Number, default: 0 },
    rank3: { type: Number, default: 0 },
  },
  matchTime: {
    type: Date,
    required: true,
  },
  totalSlots: {
    type: Number,
    required: true,
    default: 48,
  },
  joinedSlots: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  rules: {
    type: [String],
    default: [
      'No hacking or third-party tools allowed.',
      'Team teaming is strictly prohibited and leads to immediate ban.',
      'Upload screenshot of final match results containing kills & rank.',
      'Decisions made by tournament admins are final.'
    ]
  }
}, {
  timestamps: true,
});

const Tournament = mongoose.model('Tournament', tournamentSchema);
export default Tournament;
