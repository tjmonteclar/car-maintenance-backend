const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());

// Load database
const dbPath = path.join(process.cwd(), 'db.json');
let db = { users: [], records: [] };

try {
  if (fs.existsSync(dbPath)) {
    const dbData = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(dbData);
    console.log('Database loaded successfully');
  }
} catch (error) {
  console.log('Using default database structure');
}

// Helper function to save database
const saveDB = () => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Car Maintenance API is running!',
    endpoints: [
      'GET /users',
      'POST /users', 
      'GET /records',
      'POST /records',
      'PUT /records/:id',
      'DELETE /records/:id'
    ]
  });
});

// Users routes
app.get('/users', (req, res) => {
  res.json(db.users);
});

app.get('/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  user ? res.json(user) : res.status(404).json({ error: 'User not found' });
});

app.post('/users', (req, res) => {
  const newUser = {
    id: Date.now().toString(),
    ...req.body
  };
  db.users.push(newUser);
  saveDB();
  res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...req.body };
    saveDB();
    res.json(db.users[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Records routes
app.get('/records', (req, res) => {
  res.json(db.records);
});

app.get('/records/:id', (req, res) => {
  const record = db.records.find(r => r.id === req.params.id);
  record ? res.json(record) : res.status(404).json({ error: 'Record not found' });
});

app.post('/records', (req, res) => {
  const newRecord = {
    id: Date.now().toString(),
    ...req.body
  };
  db.records.push(newRecord);
  saveDB();
  res.status(201).json(newRecord);
});

app.put('/records/:id', (req, res) => {
  const index = db.records.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    db.records[index] = { ...db.records[index], ...req.body };
    saveDB();
    res.json(db.records[index]);
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

app.delete('/records/:id', (req, res) => {
  const index = db.records.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    db.records.splice(index, 1);
    saveDB();
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

// Export for Vercel
module.exports = app;