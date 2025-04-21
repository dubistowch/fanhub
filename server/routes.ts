import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProviderSchema, insertCreatorSchema, insertFollowSchema, insertCheckinSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Error handling middleware
  const handleError = (err: any, res: express.Response) => {
    console.error(err);
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        error: fromZodError(err).message
      });
    }
    return res.status(500).json({ error: err.message || "Internal server error" });
  };

  // User Routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const providers = await storage.getProvidersByUserId(userId);
      return res.json({ ...user, providers });
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const providers = await storage.getProvidersByUserId(user.id);
      return res.json({ ...user, providers });
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.json(updatedUser);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Provider Routes
  app.get("/api/users/:userId/providers", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const providers = await storage.getProvidersByUserId(userId);
      return res.json(providers);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/providers", async (req, res) => {
    try {
      const providerData = insertProviderSchema.parse(req.body);
      
      // Check if provider already exists for this user
      const existingProvider = await storage.getProviderByUserIdAndType(
        providerData.userId,
        providerData.provider
      );
      
      if (existingProvider) {
        // Update if exists
        const updatedProvider = await storage.updateProvider(existingProvider.id, providerData);
        return res.json(updatedProvider);
      }
      
      // Create if not exists
      const provider = await storage.createProvider(providerData);
      return res.status(201).json(provider);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/providers/:id", async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const success = await storage.deleteProvider(providerId);
      
      if (!success) {
        return res.status(404).json({ error: "Provider not found" });
      }
      
      return res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Creator Routes
  app.get("/api/creators", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const creators = await storage.getCreators(limit);
      
      // Enhance with additional data
      const enhancedCreators = await Promise.all(creators.map(async creator => {
        const user = await storage.getUser(creator.userId);
        const followers = await storage.getFollowersForCreator(creator.id);
        
        // Include current user follow status if userId is provided
        let isFollowedByUser = false;
        if (req.query.userId) {
          const userId = parseInt(req.query.userId as string);
          isFollowedByUser = await storage.getFollowStatus(userId, creator.id);
        }
        
        return {
          ...creator,
          user,
          followerCount: followers.length,
          isFollowedByUser
        };
      }));
      
      return res.json(enhancedCreators);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/creators/:id", async (req, res) => {
    try {
      const creatorId = parseInt(req.params.id);
      const creator = await storage.getCreator(creatorId);
      
      if (!creator) {
        return res.status(404).json({ error: "Creator not found" });
      }
      
      // Enhance with additional data
      const user = await storage.getUser(creator.userId);
      const followers = await storage.getFollowersForCreator(creator.id);
      
      // Include current user follow status if userId is provided
      let isFollowedByUser = false;
      let hasCheckedInToday = false;
      let checkinStreak = 0;
      
      if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        isFollowedByUser = await storage.getFollowStatus(userId, creator.id);
        hasCheckedInToday = await storage.getTodayCheckinStatus(userId, creator.id);
        checkinStreak = await storage.getCheckinStreak(userId, creator.id);
      }
      
      return res.json({
        ...creator,
        user,
        followerCount: followers.length,
        isFollowedByUser,
        hasCheckedInToday,
        checkinStreak
      });
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/creators", async (req, res) => {
    try {
      const creatorData = insertCreatorSchema.parse(req.body);
      
      // Check if creator profile already exists for this user
      const existingCreator = await storage.getCreatorByUserId(creatorData.userId);
      if (existingCreator) {
        return res.status(409).json({ error: "Creator profile already exists for this user" });
      }
      
      const creator = await storage.createCreator(creatorData);
      return res.status(201).json(creator);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch("/api/creators/:id", async (req, res) => {
    try {
      const creatorId = parseInt(req.params.id);
      const creatorData = insertCreatorSchema.partial().parse(req.body);
      
      const updatedCreator = await storage.updateCreator(creatorId, creatorData);
      
      if (!updatedCreator) {
        return res.status(404).json({ error: "Creator not found" });
      }
      
      return res.json(updatedCreator);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Follow Routes
  app.get("/api/users/:userId/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const followedCreators = await storage.getFollowedCreatorsForUser(userId);
      
      // Enhance with additional data
      const enhancedCreators = await Promise.all(followedCreators.map(async creator => {
        const user = await storage.getUser(creator.userId);
        const followers = await storage.getFollowersForCreator(creator.id);
        const hasCheckedInToday = await storage.getTodayCheckinStatus(userId, creator.id);
        const checkinStreak = await storage.getCheckinStreak(userId, creator.id);
        
        return {
          ...creator,
          user,
          followerCount: followers.length,
          isFollowedByUser: true,
          hasCheckedInToday,
          checkinStreak
        };
      }));
      
      return res.json(enhancedCreators);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/creators/:creatorId/followers", async (req, res) => {
    try {
      const creatorId = parseInt(req.params.creatorId);
      const followers = await storage.getFollowersForCreator(creatorId);
      return res.json(followers);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/follows", async (req, res) => {
    try {
      const followData = insertFollowSchema.parse(req.body);
      const follow = await storage.createFollow(followData);
      return res.status(201).json(follow);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/follows", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number(),
        creatorId: z.number()
      });
      
      const { userId, creatorId } = schema.parse(req.body);
      const success = await storage.deleteFollow(userId, creatorId);
      
      if (!success) {
        return res.status(404).json({ error: "Follow relationship not found" });
      }
      
      return res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Check-in Routes
  app.post("/api/checkins", async (req, res) => {
    try {
      const checkinData = insertCheckinSchema.parse(req.body);
      
      // Check if user has already checked in today
      const alreadyCheckedIn = await storage.getTodayCheckinStatus(
        checkinData.userId,
        checkinData.creatorId
      );
      
      if (alreadyCheckedIn) {
        return res.status(409).json({ error: "Already checked in today" });
      }
      
      const checkin = await storage.createCheckin(checkinData);
      const streak = await storage.getCheckinStreak(checkinData.userId, checkinData.creatorId);
      
      return res.status(201).json({ 
        ...checkin,
        streak
      });
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/creators/:creatorId/checkins/recent", async (req, res) => {
    try {
      const creatorId = parseInt(req.params.creatorId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const recentCheckins = await storage.getRecentCheckins(creatorId, limit);
      return res.json(recentCheckins);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/users/:userId/creators/:creatorId/checkin-status", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const creatorId = parseInt(req.params.creatorId);
      
      const hasCheckedInToday = await storage.getTodayCheckinStatus(userId, creatorId);
      const checkinStreak = await storage.getCheckinStreak(userId, creatorId);
      
      return res.json({
        hasCheckedInToday,
        checkinStreak
      });
    } catch (err) {
      handleError(err, res);
    }
  });

  return httpServer;
}
