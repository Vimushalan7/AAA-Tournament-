import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/ff_tournament');
const TournamentParticipant = mongoose.model('TournamentParticipant', new mongoose.Schema({}, { strict: false }));
const Tournament = mongoose.model('Tournament', new mongoose.Schema({}, { strict: false }));

const participants = await TournamentParticipant.find({}).lean();
for (const p of participants) {
  const t = await Tournament.findById(p.tournamentId).lean();
  console.log(JSON.stringify({ 
    tournament: t?.title, 
    joinedSlots: t?.joinedSlots,
    totalSlots: t?.totalSlots,
    teamMembersCount: p.teamMembers?.length || 0,
    teamMembers: p.teamMembers
  }, null, 2));
}
process.exit(0);
