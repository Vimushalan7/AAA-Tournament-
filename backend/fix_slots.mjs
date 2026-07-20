import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/ff_tournament');

const Tournament = mongoose.model('Tournament', new mongoose.Schema({}, { strict: false }));
const TournamentParticipant = mongoose.model('TournamentParticipant', new mongoose.Schema({}, { strict: false }));

const participants = await TournamentParticipant.find({}).lean();

for (const p of participants) {
  const members = p.teamMembers;
  if (members && members.length > 0) {
    // This squad has members — team size is members.length (already includes all members)
    const teamSize = members.length;
    // Find the tournament and see how much it was under-counted
    const t = await Tournament.findById(p.tournamentId);
    if (t) {
      // We added 1 but should have added teamSize, so add (teamSize - 1) more
      const delta = teamSize - 1;
      if (delta > 0) {
        await Tournament.findByIdAndUpdate(p.tournamentId, { $inc: { joinedSlots: delta } });
        console.log(`Fixed tournament "${t.title || t._id}": added ${delta} more slots for squad participant ${p._id}`);
      }
    }
  }
}

console.log('Done!');
process.exit(0);
