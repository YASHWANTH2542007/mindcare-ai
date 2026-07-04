const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set. Add it to your .env file.');
  process.exit(1);
}

// Render's free Postgres requires SSL; local Postgres usually doesn't.
// This flag lets you toggle it via .env without touching code.
const useSSL = process.env.DATABASE_SSL !== 'false';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: useSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Render's managed Postgres uses a cert chain that needs this
        },
      }
    : {},
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL connected → ${sequelize.getDatabaseName()}`);
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
