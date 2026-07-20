import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    unique: true, // 1 room per tournament
  },
  roomId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired'],
    default: 'pending',
  },
  sentToPlayers: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
