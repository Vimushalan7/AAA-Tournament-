import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetId: {
    type: String, // ID of user, tournament, transaction, etc.
    default: '',
  },
  details: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const AdminLog = mongoose.model('AdminLog', adminLogSchema);
export default AdminLog;
