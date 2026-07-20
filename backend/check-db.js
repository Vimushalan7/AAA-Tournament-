import mongoose from 'mongoose';
import User from './models/User.js';
import Tournament from './models/Tournament.js';
import TournamentParticipant from './models/TournamentParticipant.js';

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ff_tournament');
    console.log('MongoDB Connected!');
    
    const users = await User.find({}, 'name mobile walletBalance status');
    console.log('USERS_QUERY:', JSON.stringify(users, null, 2));
    
    const tournaments = await Tournament.find({}, 'title entryFee joinedSlots status');
    console.log('TOURNAMENTS_QUERY:', JSON.stringify(tournaments, null, 2));
    
    const participants = await TournamentParticipant.find({});
    console.log('PARTICIPANTS_QUERY:', JSON.stringify(participants, null, 2));
  } catch (err) {
    console.error('Error during query:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
