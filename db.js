require('dotenv').config();
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const db = new DatabaseSync(process.env.DB_FILE || path.join(__dirname, 'destinations.db'));
db.exec('PRAGMA journal_mode = WAL');

db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

// Seed only when the table is empty
const { n } = db.prepare('SELECT COUNT(*) AS n FROM destinations').get();
if (n === 0) db.exec(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));

module.exports = db;

