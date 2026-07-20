import mongoose from 'mongoose';

const tournamentParticipantSchema = new mongoose.Schema({
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
  email: {
    type: String,
  },
  ffName: {
    type: String,
  },
  freeFireUid: {
    type: String,
    required: true,
  },
  teamMembers: [{
    ffName: String,
    freeFireUid: String,
  }],
  status: {
    type: String,
    enum: ['joined', 'disqualified'],
    default: 'joined',
  },
  kills: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    default: 0,
  },
  prizeWon: {
    type: Number,
    default: 0,
  },
  prizeClaimed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure a user can only register once per tournament
tournamentParticipantSchema.index({ tournamentId: 1, userId: 1 }, { unique: true });

const TournamentParticipant = mongoose.model('TournamentParticipant', tournamentParticipantSchema);
export default TournamentParticipant;
