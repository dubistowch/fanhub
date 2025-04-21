import { users, providers, creators, follows, checkins, checkinStats, type CheckinDateStats, type CheckinStat, type CheckinWithUser, type Checkin, type Creator, type CreatorWithDetails, type Follow, type InsertCheckin, type InsertCheckinStat, type InsertCreator, type InsertFollow, type InsertProvider, type InsertUser, type Provider, type User, type UserCreatorStreak, type UserWithProviders } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc, lt, gte, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Provider methods
  getProvidersByUserId(userId: number): Promise<Provider[]>;
  getProviderByUserIdAndType(userId: number, provider: string): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, data: Partial<InsertProvider>): Promise<Provider | undefined>;
  deleteProvider(id: number): Promise<boolean>;
  
  // Creator methods
  getCreator(id: number): Promise<Creator | undefined>;
  getCreatorByUserId(userId: number): Promise<Creator | undefined>;
  getCreators(limit?: number): Promise<Creator[]>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  updateCreator(id: number, data: Partial<InsertCreator>): Promise<Creator | undefined>;
  
  // Follow methods
  getFollowersForCreator(creatorId: number): Promise<User[]>;
  getFollowedCreatorsForUser(userId: number): Promise<Creator[]>;
  getFollowStatus(userId: number, creatorId: number): Promise<boolean>;
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(userId: number, creatorId: number): Promise<boolean>;
  
  // Checkin methods
  getCheckinStatus(userId: number, creatorId: number, date: Date): Promise<boolean>;
  getTodayCheckinStatus(userId: number, creatorId: number): Promise<boolean>;
  getCheckinStreak(userId: number, creatorId: number): Promise<number>;
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  getRecentCheckins(creatorId: number, limit?: number): Promise<{user: User, date: Date}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private providers: Map<number, Provider>;
  private creators: Map<number, Creator>;
  private follows: Map<number, Follow>;
  private checkins: Map<number, Checkin>;
  private currentUserIds: Record<string, number>;
  private currentProviderIds: Record<string, number>;
  private currentCreatorIds: Record<string, number>;
  private currentFollowIds: Record<string, number>;
  private currentCheckinIds: Record<string, number>;

  constructor() {
    this.users = new Map();
    this.providers = new Map();
    this.creators = new Map();
    this.follows = new Map();
    this.checkins = new Map();
    this.currentUserIds = { current: 1 };
    this.currentProviderIds = { current: 1 };
    this.currentCreatorIds = { current: 1 };
    this.currentFollowIds = { current: 1 };
    this.currentCheckinIds = { current: 1 };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserIds.current++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Provider methods
  async getProvidersByUserId(userId: number): Promise<Provider[]> {
    return Array.from(this.providers.values()).filter(
      provider => provider.userId === userId
    );
  }

  async getProviderByUserIdAndType(userId: number, provider: string): Promise<Provider | undefined> {
    return Array.from(this.providers.values()).find(
      p => p.userId === userId && p.provider === provider
    );
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const id = this.currentProviderIds.current++;
    const provider: Provider = { ...insertProvider, id, createdAt: new Date() };
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(id: number, data: Partial<InsertProvider>): Promise<Provider | undefined> {
    const provider = this.providers.get(id);
    if (!provider) return undefined;
    
    const updatedProvider = { ...provider, ...data };
    this.providers.set(id, updatedProvider);
    return updatedProvider;
  }

  async deleteProvider(id: number): Promise<boolean> {
    return this.providers.delete(id);
  }

  // Creator methods
  async getCreator(id: number): Promise<Creator | undefined> {
    return this.creators.get(id);
  }

  async getCreatorByUserId(userId: number): Promise<Creator | undefined> {
    return Array.from(this.creators.values()).find(
      creator => creator.userId === userId
    );
  }

  async getCreators(limit?: number): Promise<Creator[]> {
    const creators = Array.from(this.creators.values());
    return limit ? creators.slice(0, limit) : creators;
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const id = this.currentCreatorIds.current++;
    const creator: Creator = { ...insertCreator, id, createdAt: new Date() };
    this.creators.set(id, creator);
    return creator;
  }

  async updateCreator(id: number, data: Partial<InsertCreator>): Promise<Creator | undefined> {
    const creator = await this.getCreator(id);
    if (!creator) return undefined;
    
    const updatedCreator = { ...creator, ...data };
    this.creators.set(id, updatedCreator);
    return updatedCreator;
  }

  // Follow methods
  async getFollowersForCreator(creatorId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(follow => follow.creatorId === creatorId)
      .map(follow => follow.userId);
    
    return Array.from(this.users.values()).filter(user => 
      followerIds.includes(user.id)
    );
  }

  async getFollowedCreatorsForUser(userId: number): Promise<Creator[]> {
    const creatorIds = Array.from(this.follows.values())
      .filter(follow => follow.userId === userId)
      .map(follow => follow.creatorId);
    
    return Array.from(this.creators.values()).filter(creator => 
      creatorIds.includes(creator.id)
    );
  }

  async getFollowStatus(userId: number, creatorId: number): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      follow => follow.userId === userId && follow.creatorId === creatorId
    );
  }

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    // Check if follow already exists
    const existingFollow = Array.from(this.follows.values()).find(
      follow => follow.userId === insertFollow.userId && follow.creatorId === insertFollow.creatorId
    );
    
    if (existingFollow) return existingFollow;
    
    const id = this.currentFollowIds.current++;
    const follow: Follow = { ...insertFollow, id, createdAt: new Date() };
    this.follows.set(id, follow);
    return follow;
  }

  async deleteFollow(userId: number, creatorId: number): Promise<boolean> {
    const followToDelete = Array.from(this.follows.values()).find(
      follow => follow.userId === userId && follow.creatorId === creatorId
    );
    
    if (!followToDelete) return false;
    return this.follows.delete(followToDelete.id);
  }

  // Checkin methods
  async getCheckinStatus(userId: number, creatorId: number, date: Date): Promise<boolean> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return Array.from(this.checkins.values()).some(checkin => {
      const checkinDate = new Date(checkin.date);
      checkinDate.setHours(0, 0, 0, 0);
      
      return (
        checkin.userId === userId &&
        checkin.creatorId === creatorId &&
        checkinDate.getTime() === targetDate.getTime()
      );
    });
  }

  async getTodayCheckinStatus(userId: number, creatorId: number): Promise<boolean> {
    return this.getCheckinStatus(userId, creatorId, new Date());
  }

  async getCheckinStreak(userId: number, creatorId: number): Promise<number> {
    const userCheckins = Array.from(this.checkins.values())
      .filter(checkin => checkin.userId === userId && checkin.creatorId === creatorId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
    
    if (userCheckins.length === 0) return 0;
    
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = new Date(userCheckins[0].date);
    currentDate.setHours(0, 0, 0, 0);
    
    // If the latest check-in is not today or yesterday, reset streak
    if (
      currentDate.getTime() !== today.getTime() &&
      currentDate.getTime() !== today.getTime() - 86400000
    ) {
      return 0;
    }
    
    for (let i = 1; i < userCheckins.length; i++) {
      const previousDate = new Date(userCheckins[i].date);
      previousDate.setHours(0, 0, 0, 0);
      
      // Check if the previous date is exactly one day before the current date
      if (currentDate.getTime() - previousDate.getTime() === 86400000) {
        streak++;
        currentDate = previousDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async createCheckin(insertCheckin: InsertCheckin): Promise<Checkin> {
    const id = this.currentCheckinIds.current++;
    const checkin: Checkin = { ...insertCheckin, id, date: new Date() };
    this.checkins.set(id, checkin);
    return checkin;
  }

  async getRecentCheckins(creatorId: number, limit = 10): Promise<{user: User, date: Date}[]> {
    const recentCheckins = Array.from(this.checkins.values())
      .filter(checkin => checkin.creatorId === creatorId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
    
    return Promise.all(
      recentCheckins.map(async checkin => {
        const user = await this.getUser(checkin.userId);
        return {
          user: user!,
          date: checkin.date
        };
      })
    );
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Provider methods
  async getProvidersByUserId(userId: number): Promise<Provider[]> {
    return db.select().from(providers).where(eq(providers.userId, userId));
  }

  async getProviderByUserIdAndType(userId: number, provider: string): Promise<Provider | undefined> {
    const [result] = await db
      .select()
      .from(providers)
      .where(and(eq(providers.userId, userId), eq(providers.provider, provider)));
    return result;
  }

  async createProvider(provider: InsertProvider): Promise<Provider> {
    const [newProvider] = await db.insert(providers).values(provider).returning();
    return newProvider;
  }

  async updateProvider(id: number, data: Partial<InsertProvider>): Promise<Provider | undefined> {
    const [updatedProvider] = await db
      .update(providers)
      .set(data)
      .where(eq(providers.id, id))
      .returning();
    return updatedProvider;
  }

  async deleteProvider(id: number): Promise<boolean> {
    const result = await db.delete(providers).where(eq(providers.id, id));
    return !!result;
  }

  // Creator methods
  async getCreator(id: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, id));
    return creator;
  }

  async getCreatorByUserId(userId: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.userId, userId));
    return creator;
  }

  async getCreators(limit?: number): Promise<Creator[]> {
    const query = db.select().from(creators);
    if (limit) {
      query.limit(limit);
    }
    return query;
  }

  async createCreator(creator: InsertCreator): Promise<Creator> {
    const [newCreator] = await db.insert(creators).values(creator).returning();
    return newCreator;
  }

  async updateCreator(id: number, data: Partial<InsertCreator>): Promise<Creator | undefined> {
    const [updatedCreator] = await db
      .update(creators)
      .set(data)
      .where(eq(creators.id, id))
      .returning();
    return updatedCreator;
  }

  // Follow methods
  async getFollowersForCreator(creatorId: number): Promise<User[]> {
    const followedUsers = await db
      .select({
        user: users
      })
      .from(follows)
      .where(eq(follows.creatorId, creatorId))
      .innerJoin(users, eq(follows.userId, users.id));
    
    return followedUsers.map(item => item.user);
  }

  async getFollowedCreatorsForUser(userId: number): Promise<Creator[]> {
    const followedCreators = await db
      .select({
        creator: creators
      })
      .from(follows)
      .where(eq(follows.userId, userId))
      .innerJoin(creators, eq(follows.creatorId, creators.id));
    
    return followedCreators.map(item => item.creator);
  }

  async getFollowStatus(userId: number, creatorId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.userId, userId), eq(follows.creatorId, creatorId)));
    return !!follow;
  }

  async createFollow(follow: InsertFollow): Promise<Follow> {
    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.userId, follow.userId),
          eq(follows.creatorId, follow.creatorId)
        )
      );
    
    if (existingFollow) {
      return existingFollow;
    }
    
    const [newFollow] = await db.insert(follows).values(follow).returning();
    return newFollow;
  }

  async deleteFollow(userId: number, creatorId: number): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(
        and(
          eq(follows.userId, userId),
          eq(follows.creatorId, creatorId)
        )
      );
    return !!result;
  }

  // Checkin methods
  async getCheckinStatus(userId: number, creatorId: number, date: Date): Promise<boolean> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const [checkin] = await db
      .select()
      .from(checkins)
      .where(
        and(
          eq(checkins.userId, userId),
          eq(checkins.creatorId, creatorId),
          gte(checkins.date, startDate),
          lt(checkins.date, endDate)
        )
      );
    
    return !!checkin;
  }

  async getTodayCheckinStatus(userId: number, creatorId: number): Promise<boolean> {
    return this.getCheckinStatus(userId, creatorId, new Date());
  }

  async getCheckinStreak(userId: number, creatorId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get all check-ins for this user and creator ordered by date descending
    const userCheckins = await db
      .select()
      .from(checkins)
      .where(
        and(
          eq(checkins.userId, userId),
          eq(checkins.creatorId, creatorId)
        )
      )
      .orderBy(desc(checkins.date));
    
    if (userCheckins.length === 0) return 0;
    
    // Check if latest check-in is today or yesterday
    const latestDate = new Date(userCheckins[0].date);
    latestDate.setHours(0, 0, 0, 0);
    
    if (
      latestDate.getTime() !== today.getTime() &&
      latestDate.getTime() !== yesterday.getTime()
    ) {
      return 0;
    }
    
    // Count consecutive days
    let streak = 1;
    let currentDate = latestDate;
    
    for (let i = 1; i < userCheckins.length; i++) {
      const prevCheckInDate = new Date(userCheckins[i].date);
      prevCheckInDate.setHours(0, 0, 0, 0);
      
      const expectedPrevDate = new Date(currentDate);
      expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
      
      if (prevCheckInDate.getTime() === expectedPrevDate.getTime()) {
        streak++;
        currentDate = prevCheckInDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async createCheckin(checkin: InsertCheckin): Promise<Checkin> {
    // Check if user already checked in today
    const hasCheckedIn = await this.getTodayCheckinStatus(
      checkin.userId,
      checkin.creatorId
    );
    
    if (hasCheckedIn) {
      throw new Error("User has already checked in today");
    }
    
    // Create new check-in
    const [newCheckin] = await db
      .insert(checkins)
      .values({
        ...checkin,
        date: new Date()
      })
      .returning();
    
    // Update daily stats for older dates
    await this.updateCheckinStats(checkin.creatorId);
    
    return newCheckin;
  }

  async getRecentCheckins(creatorId: number, limit = 10): Promise<{user: User, date: Date}[]> {
    // Get recent check-ins with user data
    const recentCheckins = await db
      .select({
        user: users,
        date: checkins.date
      })
      .from(checkins)
      .where(eq(checkins.creatorId, creatorId))
      .innerJoin(users, eq(checkins.userId, users.id))
      .orderBy(desc(checkins.date))
      .limit(limit);
    
    return recentCheckins.map(checkin => ({
      user: checkin.user,
      date: checkin.date!
    }));
  }

  // Added methods for new requirements
  
  /**
   * Get detailed check-ins for the past 30 days
   */
  async getDetailedRecentCheckins(creatorId: number): Promise<CheckinWithUser[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCheckins = await db
      .select({
        id: checkins.id,
        userId: checkins.userId,
        creatorId: checkins.creatorId,
        date: checkins.date,
        user: users
      })
      .from(checkins)
      .where(
        and(
          eq(checkins.creatorId, creatorId),
          gte(checkins.date, thirtyDaysAgo)
        )
      )
      .innerJoin(users, eq(checkins.userId, users.id))
      .orderBy(desc(checkins.date));
    
    return recentCheckins.map(checkin => ({
      id: checkin.id,
      userId: checkin.userId,
      creatorId: checkin.creatorId,
      date: checkin.date!,
      user: checkin.user
    }));
  }
  
  /**
   * Get historical check-in stats (daily counts for dates older than 30 days)
   */
  async getHistoricalCheckinStats(creatorId: number): Promise<CheckinDateStats[]> {
    // Get aggregated stats from checkin_stats table
    const stats = await db
      .select({
        date: checkinStats.date,
        count: checkinStats.count
      })
      .from(checkinStats)
      .where(eq(checkinStats.creatorId, creatorId))
      .orderBy(desc(checkinStats.date));
    
    return stats.map(stat => ({
      date: stat.date,
      count: stat.count
    }));
  }
  
  /**
   * Get all streaks for a user
   */
  async getUserCreatorStreaks(userId: number): Promise<UserCreatorStreak[]> {
    // Get all creators the user follows
    const followedCreators = await this.getFollowedCreatorsForUser(userId);
    
    // Get streaks for each creator
    const streaks = await Promise.all(
      followedCreators.map(async creator => {
        const streak = await this.getCheckinStreak(userId, creator.id);
        return {
          creatorId: creator.id,
          creatorName: creator.name,
          streak
        };
      })
    );
    
    // Return only creators with active streaks
    return streaks.filter(streak => streak.streak > 0);
  }
  
  /**
   * Helper method to update check-in stats for older data
   */
  private async updateCheckinStats(creatorId: number): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all dates older than 30 days that don't have stats yet
    const oldDates = await db
      .select({
        date: sql`DATE(${checkins.date})`,
        count: count()
      })
      .from(checkins)
      .where(
        and(
          eq(checkins.creatorId, creatorId),
          lt(checkins.date, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${checkins.date})`);
    
    // Insert or update stats for each date
    for (const dateStats of oldDates) {
      const dateObj = new Date(dateStats.date);
      
      // Check if stats already exist for this date
      const [existingStat] = await db
        .select()
        .from(checkinStats)
        .where(
          and(
            eq(checkinStats.creatorId, creatorId),
            eq(checkinStats.date, dateObj)
          )
        );
      
      if (existingStat) {
        // Update existing stat
        await db
          .update(checkinStats)
          .set({ count: dateStats.count })
          .where(eq(checkinStats.id, existingStat.id));
      } else {
        // Create new stat
        await db
          .insert(checkinStats)
          .values({
            creatorId,
            date: dateObj,
            count: dateStats.count
          });
      }
    }
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
