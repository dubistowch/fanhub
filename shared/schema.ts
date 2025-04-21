import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (base user account)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Connected provider platforms for users
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(), // 'google', 'discord', 'twitch', 'twitter'
  providerId: text("provider_id").notNull(),
  providerUsername: text("provider_username"),
  providerAvatar: text("provider_avatar"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Creator profiles
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follow relationships
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  creatorId: integer("creator_id").notNull().references(() => creators.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userCreatorUnique: primaryKey({ columns: [table.userId, table.creatorId] }),
  }
});

// Daily check-ins
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  creatorId: integer("creator_id").notNull().references(() => creators.id),
  date: timestamp("date").defaultNow(),
}, (table) => {
  return {
    userCreatorDateUnique: primaryKey({ columns: [table.userId, table.creatorId, table.date] }),
  }
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProviderSchema = createInsertSchema(providers).omit({ id: true, createdAt: true });
export const insertCreatorSchema = createInsertSchema(creators).omit({ id: true, createdAt: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export const insertCheckinSchema = createInsertSchema(checkins).omit({ id: true, date: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;

// Extended types for frontend use
export type UserWithProviders = User & {
  providers?: Provider[];
};

export type CreatorWithDetails = Creator & {
  user?: User;
  followerCount?: number;
  isFollowedByUser?: boolean;
  hasCheckedInToday?: boolean;
  checkinStreak?: number;
};
