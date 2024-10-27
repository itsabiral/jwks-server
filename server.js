import express from 'express';
import jwt from 'jsonwebtoken';
import jose from 'node-jose';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 8080;

let db;

const dbPath = path.join(process.cwd(), 'totally_not_my_privateKeys.db');

console.log('Database path:', dbPath);

async function initDB() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS keys (
        kid INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL,
        exp INTEGER NOT NULL
      )
    `);

    console.log('Database initialized successfully at:', dbPath);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;  
  }
}

async function storeKeyPair(expiryInSeconds) {
  const key = await jose.JWK.createKey('RSA', 2048, { alg: 'RS256', use: 'sig' });
  const serializedKey = key.toPEM(true);
  const expiration = Math.floor(Date.now() / 1000) + expiryInSeconds;

  await db.run(`INSERT INTO keys (key, exp) VALUES (?, ?)`, [serializedKey, expiration]);
}

async function getKeyFromDB(expired = false) {
  const now = Math.floor(Date.now() / 1000);
  const condition = expired ? 'exp <= ?' : 'exp > ?';

  const row = await db.get(`SELECT key FROM keys WHERE ${condition} LIMIT 1`, [now]);

  if (!row) throw new Error('No valid key found');
  return jose.JWK.asKey(row.key, 'pem');
}

app.post('/auth', async (req, res) => {
  try {
    const expired = req.query.expired === 'true';
    const key = await getKeyFromDB(expired);

    const payload = {
      user: 'sampleUser',
      iat: Math.floor(Date.now() / 1000),
      exp: expired
        ? Math.floor(Date.now() / 1000) - 3600
        : Math.floor(Date.now() / 1000) + 3600,
    };

    const token = jwt.sign(payload, key.toPEM(true), {
      algorithm: 'RS256',
      header: { kid: key.kid, typ: 'JWT' },
    });

    res.send(token);
  } catch (error) {
    res.status(500).send('Error generating JWT: ' + error.message);
  }
});

// GET /.well-known/jwks.json endpoint to fetch all valid keys
app.get('/.well-known/jwks.json', async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);

    // Use parameterized query to avoid SQL injection
    const rows = await db.all(`SELECT key FROM keys WHERE exp > ?`, [now]);

    const keys = await Promise.all(
      rows.map(async (row) => {
        const key = await jose.JWK.asKey(row.key, 'pem');
        return key.toJSON();
      })
    );

    res.setHeader('Content-Type', 'application/json');
    res.json({ keys });
  } catch (error) {
    res.status(500).send('Error retrieving keys: ' + error.message);
  }
});

// Initialize DB, store keys, and start the server
async function startServer() {
  try {
    await initDB();  // Ensure DB is initialized
    await storeKeyPair(-3600);  // Store expired key
    await storeKeyPair(3600);   // Store valid key

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
export { app };
