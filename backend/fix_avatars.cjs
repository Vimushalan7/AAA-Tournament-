const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ff_tournament');
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  for (let user of users) {
    let pic = user.profilePic;
    if (pic && (pic.includes('unsplash') || pic.includes('/avatars/'))) {
      await mongoose.connection.db.collection('users').updateOne({ _id: user._id }, { $set: { profilePic: '' } });
      console.log('Updated user:', user.email || user.mobile);
    }
  }
  process.exit(0);
}
fix();
