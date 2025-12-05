// Vercel Serverless Function - Self-contained
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { users, settings, insertUserSchema, loginSchema, updateSettingsSchema } from './schema.js';

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
    secure: false, // Set to false for now to test, can enable with proper HTTPS setup
    sameSite: 'lax',
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
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const [user] = await db.insert(users).values({
      email: validatedData.email,
      password: hashedPassword,
      fullName: validatedData.fullName,
    }).returning();
    
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
    console.log('[Signin] Attempt:', req.body.email);
    const validatedData = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1);
    
    if (!user) {
      console.log('[Signin] User not found:', validatedData.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isValidPassword) {
      console.log('[Signin] Invalid password for:', validatedData.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    req.session.authenticated = true;
    req.session.userId = user.id;
    
    console.log('[Signin] Success:', user.email, 'Session ID:', req.sessionID);
    
    res.json({ 
      id: user.id, 
      email: user.email, 
      fullName: user.fullName 
    });
  } catch (error) {
    console.error('[Signin] Error:', error);
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

// Settings routes
app.get('/api/settings', isAuthenticated, async (req, res) => {
  try {
    const [userSettings] = await db.select().from(settings).limit(1);
    
    if (!userSettings) {
      // Return default settings if none exist
      return res.json({
        apiKey: null,
        token: null,
        apiEndpoint: "https://textbelt.com/text",
        defaultCountryCode: "+1",
        autoSaveDrafts: true,
        messageConfirmations: false,
      });
    }
    
    res.json(userSettings);
  } catch (error) {
    console.error('[Settings] Get error:', error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

app.post('/api/settings', isAuthenticated, async (req, res) => {
  try {
    console.log('[Settings] Update attempt:', req.body);
    const validatedData = updateSettingsSchema.parse(req.body);
    
    // Check if settings exist
    const [existingSettings] = await db.select().from(settings).limit(1);
    
    let result;
    if (existingSettings) {
      // Update existing settings
      [result] = await db.update(settings)
        .set(validatedData)
        .where(eq(settings.id, existingSettings.id))
        .returning();
    } else {
      // Insert new settings
      [result] = await db.insert(settings)
        .values(validatedData)
        .returning();
    }
    
    console.log('[Settings] Update success:', result);
    res.json(result);
  } catch (error) {
    console.error('[Settings] Update error:', error);
    res.status(400).json({ message: error.message || "Failed to update settings" });
  }
});

// Test Textbelt connection
app.post('/api/settings/test', isAuthenticated, async (req, res) => {
  try {
    const { apiKey, apiEndpoint } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ message: "API key is required" });
    }
    
    const endpoint = apiEndpoint || "https://textbelt.com/text";
    
    // Test with a quota check
    const response = await fetch(`https://textbelt.com/quota/${apiKey}`);
    const data = await response.json();
    
    if (data.success === false) {
      return res.status(400).json({ message: data.error || "Invalid API key" });
    }
    
    res.json({ 
      success: true, 
      quotaRemaining: data.quotaRemaining,
      message: `Connection successful. ${data.quotaRemaining} messages remaining.`
    });
  } catch (error) {
    console.error('[Settings] Test error:', error);
    res.status(500).json({ message: "Failed to test connection" });
  }
});

// Get account balance
app.get('/api/account/balance', isAuthenticated, async (req, res) => {
  try {
    const [userSettings] = await db.select().from(settings).limit(1);
    
    if (!userSettings?.apiKey) {
      return res.status(400).json({ 
        message: "API key not configured", 
        balance: null 
      });
    }
    
    const response = await fetch(`https://textbelt.com/quota/${userSettings.apiKey}`);
    
    // Check if response is ok before parsing
    if (!response.ok) {
      const text = await response.text();
      console.error('[Balance] API error:', response.status, text);
      return res.status(400).json({ 
        message: "Failed to fetch balance from Textbelt",
        balance: null
      });
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[Balance] Non-JSON response:', text);
      
      // Handle rate limiting or error messages
      if (text.includes('Too many requests') || text.includes('rate limit')) {
        return res.status(429).json({ 
          message: "Rate limit exceeded. Please try again later.",
          balance: null
        });
      }
      
      return res.status(500).json({ 
        message: "Invalid response from Textbelt",
        balance: null
      });
    }
    
    const data = await response.json();
    
    if (data.success === false) {
      return res.status(400).json({ 
        message: data.error || "Failed to fetch balance",
        balance: null
      });
    }
    
    res.json({ 
      balance: data.quotaRemaining,
      success: true
    });
  } catch (error) {
    console.error('[Balance] Error:', error);
    res.status(500).json({ 
      message: "Failed to fetch balance",
      balance: null
    });
  }
});

// Get account usage
app.get('/api/account/usage', isAuthenticated, async (req, res) => {
  try {
    // For now, return mock data since Textbelt doesn't have a usage endpoint
    res.json({ 
      messagesSent: 0,
      messagesTotal: 0,
      lastMessageDate: null
    });
  } catch (error) {
    console.error('[Usage] Error:', error);
    res.status(500).json({ 
      message: "Failed to fetch usage",
    });
  }
});

// Contacts routes
app.get('/api/contacts', isAuthenticated, async (req, res) => {
  try {
    // Return empty array for now - contacts feature not implemented yet
    res.json([]);
  } catch (error) {
    console.error('[Contacts] Error:', error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

app.post('/api/contacts', isAuthenticated, async (req, res) => {
  try {
    // Placeholder for adding contacts
    res.status(501).json({ message: "Contacts feature not implemented yet" });
  } catch (error) {
    console.error('[Contacts] Error:', error);
    res.status(500).json({ message: "Failed to add contact" });
  }
});

// Messages routes
app.get('/api/messages', isAuthenticated, async (req, res) => {
  try {
    // Return empty array for now - message history not implemented yet
    res.json([]);
  } catch (error) {
    console.error('[Messages] Error:', error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

app.post('/api/messages', isAuthenticated, async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ message: "Phone and message are required" });
    }
    
    const [userSettings] = await db.select().from(settings).limit(1);
    
    if (!userSettings?.apiKey) {
      return res.status(400).json({ message: "API key not configured" });
    }
    
    // Send SMS via Textbelt
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        message,
        key: userSettings.apiKey
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      return res.status(400).json({ 
        message: data.error || "Failed to send message",
        success: false
      });
    }
    
    res.json({
      success: true,
      message: "Message sent successfully",
      textId: data.textId,
      quotaRemaining: data.quotaRemaining
    });
  } catch (error) {
    console.error('[Messages] Send error:', error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// POST /api/messages/send - Send SMS (frontend uses this endpoint)
app.post('/api/messages/send', isAuthenticated, async (req, res) => {
  try {
    const { recipientPhone, recipientName, content } = req.body;
    
    if (!recipientPhone || !content) {
      return res.status(400).json({ message: "Phone number and message content are required" });
    }
    
    const [userSettings] = await db.select().from(settings).limit(1);
    
    if (!userSettings?.apiKey) {
      return res.status(400).json({ message: "API key not configured. Please configure your Textbelt API key in settings." });
    }
    
    // Send SMS via Textbelt
    const response = await fetch(userSettings.apiEndpoint || 'https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: recipientPhone,
        message: content,
        key: userSettings.apiKey
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('[Messages] Textbelt error:', data);
      return res.status(400).json({ 
        message: data.error || "Failed to send message",
        success: false
      });
    }
    
    console.log('[Messages] SMS sent successfully:', {
      phone: recipientPhone,
      textId: data.textId,
      quotaRemaining: data.quotaRemaining
    });
    
    res.json({
      success: true,
      message: "Message sent successfully",
      textId: data.textId,
      quotaRemaining: data.quotaRemaining
    });
  } catch (error) {
    console.error('[Messages] Send error:', error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Other API routes would go here
// For now, just return 404 for unhandled routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

export default app;
