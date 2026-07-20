import mongoose from 'mongoose';
import User from './models/User.js';

// Monkey patch startSession
mongoose.startSession = async function() {
  console.log('MOCK startSession called!');
  return {
    inTransaction: () => false,
    startTransaction: () => {
      console.log('MOCK startTransaction');
    },
    commitTransaction: async () => {
      console.log('MOCK commitTransaction');
    },
    abortTransaction: async () => {
      console.log('MOCK abortTransaction');
    },
    endSession: () => {
      console.log('MOCK endSession');
    }
  };
};

async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ff_tournament');
    console.log('DB Connected.');

    const session = await mongoose.startSession();
    session.startTransaction();

    // Query with session
    const users = await User.find({}).session(session);
    console.log('Users found:', users.length);

    session.endSession();
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
