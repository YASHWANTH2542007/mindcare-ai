/**
 * Optional helper script — creates one demo user so you can log in
 * immediately without going through the signup form.
 *
 * Run with: npm run seed
 */
require('dotenv').config();
const { sequelize, connectDB } = require('./config/db');
const User = require('./models/User');

async function seed() {
  await connectDB();
  await sequelize.sync(); // creates tables if they don't exist yet

  const email = 'demo@mindcare.ai';
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    console.log('Demo user already exists:', email);
  } else {
    const passwordHash = await User.hashPassword('demo12345');
    await User.create({
      name: 'Yashwanth',
      email,
      passwordHash,
      institution: 'TJS College of Arts and Science',
    });
    console.log('✅ Demo user created:');
    console.log('   email:    demo@mindcare.ai');
    console.log('   password: demo12345');
  }

  await sequelize.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
