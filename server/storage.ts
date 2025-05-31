import { users, demoRequests, type User, type InsertUser, type DemoRequest, type InsertDemoRequest } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDemoRequest(demoRequest: InsertDemoRequest): Promise<DemoRequest>;
  getDemoRequest(id: number): Promise<DemoRequest | undefined>;
  updateDemoRequest(id: number, updates: Partial<DemoRequest>): Promise<DemoRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private demoRequests: Map<number, DemoRequest>;
  currentUserId: number;
  currentDemoRequestId: number;

  constructor() {
    this.users = new Map();
    this.demoRequests = new Map();
    this.currentUserId = 1;
    this.currentDemoRequestId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDemoRequest(insertDemoRequest: InsertDemoRequest): Promise<DemoRequest> {
    const id = this.currentDemoRequestId++;
    const now = new Date();
    const demoRequest: DemoRequest = {
      id,
      firstName: insertDemoRequest.firstName,
      lastName: insertDemoRequest.lastName,
      email: insertDemoRequest.email,
      phoneNumber: insertDemoRequest.phoneNumber || null,
      companyName: insertDemoRequest.companyName,
      companySize: insertDemoRequest.companySize || null,
      jobTitle: insertDemoRequest.jobTitle || null,
      department: insertDemoRequest.department || null,
      industry: insertDemoRequest.industry || null,
      useCase: insertDemoRequest.useCase || null,
      challenges: insertDemoRequest.challenges || null,
      timeline: insertDemoRequest.timeline || null,
      budget: insertDemoRequest.budget || null,
      hearAboutUs: insertDemoRequest.hearAboutUs || null,
      hubspotContactId: null,
      hubspotDealId: null,
      calendlyEventId: null,
      status: "submitted",
      createdAt: now,
      updatedAt: now,
    };
    this.demoRequests.set(id, demoRequest);
    return demoRequest;
  }

  async getDemoRequest(id: number): Promise<DemoRequest | undefined> {
    return this.demoRequests.get(id);
  }

  async updateDemoRequest(id: number, updates: Partial<DemoRequest>): Promise<DemoRequest | undefined> {
    const existing = this.demoRequests.get(id);
    if (!existing) return undefined;
    
    const updated: DemoRequest = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.demoRequests.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
