// Vercel Serverless Function - Standalone Entry Point
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import session from 'express-session';
import { storage } from '../dist-server/server/storage.js';
import { insertUserSchema, loginSchema } from '../dist-server/shared/schema.js';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "simple-sms-app-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    const existingUser = await storage.getUserByEmail(validatedData.email);
    
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = await storage.createUser({
      email: validatedData.email,
      password: hashedPassword,
      fullName: validatedData.fullName,
    });
    
    req.session.authenticated = true;
    req.session.userId = user.id;
    
    res.json({ 
      id: user.id, 
      email: user.email, 
      fullName: user.fullName 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await storage.getUserByEmail(validatedData.email);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    req.session.authenticated = true;
    req.session.userId = user.id;
    
    res.json({ 
      id: user.id, 
      email: user.email, 
      fullName: user.fullName 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({ authenticated: true, userId: req.session.userId });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Other API routes would go here (contacts, messages, etc.)
// For now, just return 404 for unhandled routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

export default app;
