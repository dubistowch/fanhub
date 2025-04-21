import { users, providers, creators, follows, checkins, checkinStats, type CheckinDateStats, type CheckinStat, type CheckinWithUser, type Checkin, type Creator, type CreatorWithDetails, type Follow, type InsertCheckin, type InsertCheckinStat, type InsertCreator, type InsertFollow, type InsertProvider, type InsertUser, type Provider, type User, type UserCreatorStreak, type UserWithProviders } from "@shared/schema";
import { db } from "./db-supabase";
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

export class SupabaseStorage implements IStorage {
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
    
    // Get all checkins for this user-creator pair
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
    
    // Ensure first checkin is from today or yesterday
    const firstCheckinDate = new Date(userCheckins[0].date!);
    firstCheckinDate.setHours(0, 0, 0, 0);
    
    if (
      firstCheckinDate.getTime() !== today.getTime() &&
      firstCheckinDate.getTime() !== yesterday.getTime()
    ) {
      return 0;
    }
    
    let streak = 1;
    let currentDate = firstCheckinDate;
    let expectedDate = new Date(currentDate);
    
    for (let i = 1; i < userCheckins.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      
      const checkinDate = new Date(userCheckins[i].date!);
      checkinDate.setHours(0, 0, 0, 0);
      
      if (checkinDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async createCheckin(checkin: InsertCheckin): Promise<Checkin> {
    // Check if user has already checked in today
    const today = new Date();
    const hasCheckedInToday = await this.getTodayCheckinStatus(checkin.userId, checkin.creatorId);
    
    if (hasCheckedInToday) {
      // Find the existing checkin
      const startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      
      const [existingCheckin] = await db
        .select()
        .from(checkins)
        .where(
          and(
            eq(checkins.userId, checkin.userId),
            eq(checkins.creatorId, checkin.creatorId),
            gte(checkins.date, startDate),
            lt(checkins.date, endDate)
          )
        );
      
      return existingCheckin!;
    }
    
    // New checkin
    const [newCheckin] = await db
      .insert(checkins)
      .values({ ...checkin, date: today })
      .returning();
    
    // Update the checkin stats for this creator and date
    const statDate = new Date(today);
    statDate.setHours(0, 0, 0, 0);
    
    // Check if there's an existing stat record
    const [existingStat] = await db
      .select()
      .from(checkinStats)
      .where(
        and(
          eq(checkinStats.creatorId, checkin.creatorId),
          eq(checkinStats.date, statDate)
        )
      );
    
    if (existingStat) {
      // Update the existing stat
      await db
        .update(checkinStats)
        .set({ count: existingStat.count + 1 })
        .where(eq(checkinStats.id, existingStat.id));
    } else {
      // Create a new stat record
      await db
        .insert(checkinStats)
        .values({
          creatorId: checkin.creatorId,
          date: statDate,
          count: 1
        });
    }
    
    return newCheckin;
  }

  async getRecentCheckins(creatorId: number, limit = 10): Promise<{user: User, date: Date}[]> {
    const result = await db
      .select({
        user: users,
        date: checkins.date
      })
      .from(checkins)
      .where(eq(checkins.creatorId, creatorId))
      .innerJoin(users, eq(checkins.userId, users.id))
      .orderBy(desc(checkins.date))
      .limit(limit);
    
    return result.map(item => ({
      user: item.user,
      date: item.date as Date
    }));
  }
    
  /**
   * Get historical check-in stats (daily counts for dates)
   */
  async getCheckinStats(creatorId: number): Promise<CheckinDateStats[]> {
    const result = await db
      .select({
        date: checkinStats.date,
        count: checkinStats.count
      })
      .from(checkinStats)
      .where(eq(checkinStats.creatorId, creatorId))
      .orderBy(desc(checkinStats.date));
    
    return result.map(item => ({
      date: item.date as Date,
      count: item.count
    }));
  }
    
  /**
   * Get detailed recent check-ins with user info
   */
  async getDetailedRecentCheckins(creatorId: number): Promise<CheckinWithUser[]> {
    const result = await db
      .select({
        id: checkins.id,
        userId: checkins.userId,
        creatorId: checkins.creatorId,
        date: checkins.date,
        user: users
      })
      .from(checkins)
      .where(eq(checkins.creatorId, creatorId))
      .innerJoin(users, eq(checkins.userId, users.id))
      .orderBy(desc(checkins.date))
      .limit(100);
    
    return result as CheckinWithUser[];
  }
    
  /**
   * Get all streaks for a user
   */
  async getUserCreatorStreaks(userId: number): Promise<UserCreatorStreak[]> {
    // Get all creators the user has checked in with
    const creatorIds = await db
      .selectDistinct({ creatorId: checkins.creatorId })
      .from(checkins)
      .where(eq(checkins.userId, userId));
    
    // Get streak for each creator
    const result: UserCreatorStreak[] = [];
    
    for (const { creatorId } of creatorIds) {
      const streak = await this.getCheckinStreak(userId, creatorId);
      const [creator] = await db
        .select({ name: creators.name })
        .from(creators)
        .where(eq(creators.id, creatorId));
      
      if (creator) {
        result.push({
          creatorId,
          creatorName: creator.name,
          streak
        });
      }
    }
    
    return result;
  }
}

export const storage = new SupabaseStorage();