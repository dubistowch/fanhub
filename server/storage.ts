import { users, type User, type InsertUser, providers, type Provider, type InsertProvider, creators, type Creator, type InsertCreator, follows, type Follow, type InsertFollow, checkins, type Checkin, type InsertCheckin, type UserWithProviders, type CreatorWithDetails } from "@shared/schema";

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

export const storage = new MemStorage();
