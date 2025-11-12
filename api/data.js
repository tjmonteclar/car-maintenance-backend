const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Database file path
const dbPath = path.join(process.cwd(), 'db.json');

// Load database
function loadDB() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error loading DB:', error);
  }
  return { users: [], records: [] };
}

// Save database
function saveDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.log('Error saving DB:', error);
    return false;
  }
}

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Car Maintenance API is running!',
    timestamp: new Date().toISOString()
  });
});

// Users endpoints
app.get('/users', (req, res) => {
  const db = loadDB();
  res.json(db.users);
});

app.post('/users', (req, res) => {
  const db = loadDB();
  const newUser = {
    id: Date.now().toString(),
    ...req.body
  };
  db.users.push(newUser);
  if (saveDB(db)) {
    res.status(201).json(newUser);
  } else {
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// Records endpoints
app.get('/records', (req, res) => {
  const db = loadDB();
  res.json(db.records);
});

app.post('/records', (req, res) => {
  const db = loadDB();
  const newRecord = {
    id: Date.now().toString(),
    ...req.body
  };
  db.records.push(newRecord);
  if (saveDB(db)) {
    res.status(201).json(newRecord);
  } else {
    res.status(500).json({ error: 'Failed to save record' });
  }
});

app.put('/records/:id', (req, res) => {
  const db = loadDB();
  const index = db.records.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    db.records[index] = { ...db.records[index], ...req.body };
    if (saveDB(db)) {
      res.json(db.records[index]);
    } else {
      res.status(500).json({ error: 'Failed to update record' });
    }
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

app.delete('/records/:id', (req, res) => {
  const db = loadDB();
  const index = db.records.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    db.records.splice(index, 1);
    if (saveDB(db)) {
      res.status(204).send();
    } else {
      res.status(500).json({ error: 'Failed to delete record' });
    }
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

// Export for Vercel
module.exports = app;