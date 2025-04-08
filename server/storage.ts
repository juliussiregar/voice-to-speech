import { users, type User, type InsertUser, type TtsConversion, type InsertTtsConversion } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // TTS operations
  saveTtsConversion(conversion: InsertTtsConversion): Promise<TtsConversion>;
  getTtsConversionById(id: number): Promise<TtsConversion | undefined>;
  getRecentTtsConversions(limit: number): Promise<TtsConversion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ttsConversions: Map<number, TtsConversion>;
  private userCurrentId: number;
  private ttsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.ttsConversions = new Map();
    this.userCurrentId = 1;
    this.ttsCurrentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // TTS operations
  async saveTtsConversion(insertConversion: InsertTtsConversion): Promise<TtsConversion> {
    const id = this.ttsCurrentId++;
    const now = new Date();
    
    const conversion: TtsConversion = { 
      ...insertConversion, 
      id, 
      createdAt: now
    };
    
    this.ttsConversions.set(id, conversion);
    return conversion;
  }
  
  async getTtsConversionById(id: number): Promise<TtsConversion | undefined> {
    return this.ttsConversions.get(id);
  }
  
  async getRecentTtsConversions(limit: number): Promise<TtsConversion[]> {
    return Array.from(this.ttsConversions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
