const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/terraquest').then(async () => {
  const db = mongoose.connection.db;
  
  const result = await db.collection('users').updateOne(
    { email: 'admin@terraquest.com' },
    { $set: { role: 'admin' } }
  );
  
  console.log('Matched:', result.matchedCount, '| Modified:', result.modifiedCount);
  
  const user = await db.collection('users').findOne({ email: 'admin@terraquest.com' });
  if (user) {
    console.log('SUCCESS: ' + user.email + ' -> role=' + user.role);
  } else {
    console.log('ERROR: user not found');
  }
  
  await mongoose.disconnect();
});
