import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertContactSchema, insertMessageSchema, updateSettingsSchema } from "@shared/schema";
import { z } from "zod";

// Simple session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "simple-sms-app-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

// Simple authentication middleware
const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && (req.session as any).authenticated) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(sessionMiddleware);

  // Password access route
  app.post('/api/access', async (req, res) => {
    try {
      const { password } = req.body;
      
      if (password === "Acun97") {
        (req.session as any).authenticated = true;
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Incorrect password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Check auth status
  app.get('/api/auth/status', async (req, res) => {
    if (req.session && (req.session as any).authenticated) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  // Logout route
  app.post('/api/logout', async (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Failed to logout" });
      } else {
        res.json({ success: true });
      }
    });
  });
  // Contacts routes
  app.get("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });

  app.patch("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(id, updates);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update contact" });
      }
    }
  });

  app.delete("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteContact(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Messages routes
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages/send", isAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Get API settings
      const settings = await storage.getSettings();
      if (!settings?.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please configure your Textbelt API key in settings." });
      }

      // Create message record first with default status
      const message = await storage.createMessage({
        recipientPhone: messageData.recipientPhone,
        recipientName: messageData.recipientName,
        content: messageData.content,
        status: "pending",
        cost: null,
        textbeltId: null,
        errorMessage: null
      });

      try {
        // Send via Textbelt API
        const textbeltResponse = await fetch(settings.apiEndpoint || "https://textbelt.com/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: messageData.recipientPhone,
            message: messageData.content,
            key: settings.apiKey,
          }),
        });

        const textbeltResult = await textbeltResponse.json();
        
        if (textbeltResult.success) {
          // Update message status to delivered
          await storage.updateMessage(message.id, {
            status: "delivered",
            textbeltId: textbeltResult.textId,
          });
          
          res.status(201).json({
            ...message,
            status: "delivered",
            textbeltId: textbeltResult.textId,
          });
        } else {
          // Update message status to failed
          await storage.updateMessage(message.id, {
            status: "failed",
            errorMessage: textbeltResult.error || "Unknown error",
          });
          
          res.status(400).json({
            message: "Failed to send SMS",
            error: textbeltResult.error || "Unknown error from Textbelt",
          });
        }
      } catch (apiError) {
        // Update message status to failed
        await storage.updateMessage(message.id, {
          status: "failed",
          errorMessage: "Network error communicating with Textbelt API",
        });
        
        res.status(500).json({
          message: "Failed to communicate with SMS service",
          error: "Network error",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // Delete message route
  app.delete("/api/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const messageId = req.params.id;
      const deleted = await storage.deleteMessage(messageId);
      
      if (deleted) {
        res.json({ message: "Message deleted successfully" });
      } else {
        res.status(404).json({ message: "Message not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Settings routes
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings) {
        // Return default settings
        const defaultSettings = {
          id: "",
          apiKey: null,
          apiEndpoint: "https://textbelt.com/text",
          defaultCountryCode: "+1",
          autoSaveDrafts: true,
          messageConfirmations: false,
        };
        res.json(defaultSettings);
      } else {
        res.json(settings);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const validatedData = updateSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  });

  // Account balance route
  app.get("/api/account/balance", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings?.apiKey) {
        return res.status(400).json({ 
          message: "API key not configured", 
          balance: null 
        });
      }

      try {
        const balanceResponse = await fetch(`https://textbelt.com/quota/${settings.apiKey}`);
        const balanceData = await balanceResponse.json();
        
        if (balanceData.success) {
          res.json({
            success: true,
            quotaRemaining: balanceData.quotaRemaining,
            balance: `$${(balanceData.quotaRemaining * 0.04).toFixed(2)}` // Assuming $0.04 per SMS
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Failed to fetch balance from Textbelt",
            balance: null
          });
        }
      } catch (apiError) {
        res.status(500).json({
          success: false,
          message: "Failed to communicate with Textbelt API",
          balance: null
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch account balance",
        balance: null
      });
    }
  });

  // Account usage statistics
  app.get("/api/account/usage", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getMessages();
      
      const totalMessages = messages.length;
      const deliveredMessages = messages.filter(m => m.status === 'delivered').length;
      const failedMessages = messages.filter(m => m.status === 'failed').length;
      
      const successRate = totalMessages > 0 ? 
        Math.round((deliveredMessages / totalMessages) * 100) : 0;
      
      const totalSpent = (deliveredMessages * 0.04).toFixed(2); // $0.04 per delivered SMS
      
      res.json({
        messagesSent: totalMessages,
        messagesDelivered: deliveredMessages,
        messagesFailed: failedMessages,
        successRate: successRate,
        totalSpent: `$${totalSpent}`
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch usage statistics" 
      });
    }
  });

  // Test API connection
  app.post("/api/settings/test", isAuthenticated, async (req, res) => {
    try {
      const { apiKey, apiEndpoint } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ message: "API key is required" });
      }

      const endpoint = apiEndpoint || "https://textbelt.com/text";
      
      // Test with a dummy number
      const testResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "5555551234",
          message: "Test message",
          key: apiKey,
        }),
      });

      const result = await testResponse.json();
      
      if (result.success || result.error?.includes("Invalid phone number")) {
        // API key is valid (even if phone number is invalid for test)
        res.json({ success: true, message: "API connection successful" });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.error || "API connection failed" 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to test API connection" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
