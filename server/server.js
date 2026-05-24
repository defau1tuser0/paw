import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATABASE_DIR = path.join(__dirname, 'database');

const app = express();
app.use(cors());
app.use(express.json());

const readDatabase = (file) => {
  try {
    const isTest = process.env.NODE_ENV === 'test';
    const filename = isTest ? `test_${file}` : file;
    const dbPath = path.join(DATABASE_DIR, filename);

    // Proactively copy the seed file to isolated test file if not exists yet
    if (isTest && !fs.existsSync(dbPath)) {
      const seedPath = path.join(DATABASE_DIR, file);
      if (fs.existsSync(seedPath)) {
        fs.copyFileSync(seedPath, dbPath);
      }
    }

    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
};

const writeDatabase = (file, data) => {
  try {
    const isTest = process.env.NODE_ENV === 'test';
    const filename = isTest ? `test_${file}` : file;
    const dbPath = path.join(DATABASE_DIR, filename);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing to ${file}:`, err);
  }
};

app.get('/api/cases', (req, res) => {
  const cases = readDatabase('cases.json');
  res.json(cases);
});

app.post('/api/cases', (req, res) => {
  const cases = readDatabase('cases.json');
  const { title, description, photoUrl, latitude, longitude, locationName, reporterId } = req.body;
  
  if (!title || !reporterId) {
    return res.status(400).json({ error: 'Title and reporterId are required' });
  }

  const newCase = {
    id: `case-${Date.now()}`,
    title,
    description: description || '',
    photoUrl: photoUrl || '',
    latitude: Number(latitude) || 0,
    longitude: Number(longitude) || 0,
    locationName: locationName || '',
    reporterId,
    status: 'open',
    assignedTo: null,
    createdAt: new Date().toISOString()
  };

  cases.push(newCase);
  writeDatabase('cases.json', cases);

  res.status(201).json(newCase);
});

app.get('/api/cases/:id', (req, res) => {
  const cases = readDatabase('cases.json');
  const targetCase = cases.find(c => c.id === req.params.id);
  if (!targetCase) {
    return res.status(404).json({ error: 'Case not found' });
  }
  res.json(targetCase);
});

app.put('/api/cases/:id', (req, res) => {
  const cases = readDatabase('cases.json');
  const index = cases.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Case not found' });
  }
  
  const { status, assignedTo, proofPhotoUrl } = req.body;
  if (status !== undefined) cases[index].status = status;
  if (assignedTo !== undefined) cases[index].assignedTo = assignedTo;
  if (proofPhotoUrl !== undefined) cases[index].proofPhotoUrl = proofPhotoUrl;
  
  writeDatabase('cases.json', cases);
  res.json(cases[index]);
});

app.get('/api/cases/:id/comments', (req, res) => {
  const comments = readDatabase('comments.json');
  const caseComments = comments.filter(c => c.caseId === req.params.id);
  res.json(caseComments);
});

app.post('/api/cases/:id/comments', (req, res) => {
  const comments = readDatabase('comments.json');
  const { userId, text, photoUrl, kind } = req.body;
  if (!userId || !text) {
    return res.status(400).json({ error: 'userId and text are required' });
  }
  
  const newComment = {
    id: `comment-${Date.now()}`,
    caseId: req.params.id,
    userId,
    text,
    photoUrl: photoUrl || '',
    kind: kind || 'text',
    createdAt: new Date().toISOString()
  };
  
  comments.push(newComment);
  writeDatabase('comments.json', comments);
  res.status(201).json(newComment);
});

app.get('/api/messages', (req, res) => {
  const { user1Id, user2Id } = req.query;
  if (!user1Id || !user2Id) {
    return res.status(400).json({ error: 'user1Id and user2Id are required' });
  }
  
  const messages = readDatabase('messages.json');
  const chatMessages = messages.filter(m => 
    (m.senderId === user1Id && m.receiverId === user2Id) ||
    (m.senderId === user2Id && m.receiverId === user1Id)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  res.json(chatMessages);
});

app.post('/api/messages', (req, res) => {
  const messages = readDatabase('messages.json');
  const { senderId, receiverId, text } = req.body;
  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ error: 'senderId, receiverId, and text are required' });
  }
  
  const newMsg = {
    id: `msg-${Date.now()}`,
    senderId,
    receiverId,
    text,
    createdAt: new Date().toISOString()
  };
  
  messages.push(newMsg);
  writeDatabase('messages.json', messages);
  res.status(201).json(newMsg);
});

// Authentication endpoints
app.post('/api/users/login', (req, res) => {
  const users = readDatabase('users.json');
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  // Enforce password check only if a password is set in the database
  if (user.password && user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  res.json(user);
});

app.post('/api/users/signup', (req, res) => {
  const users = readDatabase('users.json');
  const { name, email, password, role, location, bio, work } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  if (users.some(u => u.email === email)) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }
  
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password: password || '', // Save password
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`, // default avatar
    role: role || 'user',
    bio: bio || '',
    location: location || '',
    work: work || ''
  };
  
  users.push(newUser);
  writeDatabase('users.json', users);
  res.status(201).json(newUser);
});

// User management endpoints
app.get('/api/users', (req, res) => {
  const users = readDatabase('users.json');
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const users = readDatabase('users.json');
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const users = readDatabase('users.json');
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { name, bio, location, work } = req.body;
  if (name !== undefined) users[index].name = name;
  if (bio !== undefined) users[index].bio = bio;
  if (location !== undefined) users[index].location = location;
  if (work !== undefined) users[index].work = work;
  
  writeDatabase('users.json', users);
  res.json(users[index]);
});

// Friendship endpoints
app.get('/api/friendships', (req, res) => {
  const friendships = readDatabase('friendships.json');
  res.json(friendships);
});

app.post('/api/friendships', (req, res) => {
  const friendships = readDatabase('friendships.json');
  const { user1Id, user2Id } = req.body;
  if (!user1Id || !user2Id) {
    return res.status(400).json({ error: 'user1Id and user2Id are required' });
  }
  
  const exists = friendships.some(f => 
    (f.user1Id === user1Id && f.user2Id === user2Id) ||
    (f.user1Id === user2Id && f.user2Id === user1Id)
  );
  
  if (exists) {
    return res.status(409).json({ error: 'Friendship already exists' });
  }
  
  const newFriendship = { user1Id, user2Id };
  friendships.push(newFriendship);
  writeDatabase('friendships.json', friendships);
  res.status(201).json(newFriendship);
});

// Start listening if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
