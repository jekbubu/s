const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory users array (replace with a database in production)
const users = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    // password: 'password123' (hashed)
    passwordHash: '$2b$10$k4QwKQwQ1QwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw'
  }
];

app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const exists = users.some(
    u => u.email === email || u.username === username
  );
  if (exists) {
    return res.status(409).json({ message: 'User already exists.' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    username,
    email,
    passwordHash
  };
  users.push(newUser);
  res.json({ message: 'Registration successful', user: { id: newUser.id, username, email } });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    u => u.email === email || u.username === email
  );
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});