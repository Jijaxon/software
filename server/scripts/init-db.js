require('dotenv').config();
const { pool, initializeDatabase } = require('../db');

initializeDatabase()
  .then(() => console.log('PostgreSQL tables are ready.'))
  .catch((error) => {
    console.error('Could not initialize PostgreSQL tables:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());