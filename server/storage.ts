import bcrypt from "bcryptjs";
import { 
  users, 
  demoRequests, 
  projects, 
  products, 
  investorProfiles,
  type User, 
  type InsertUser, 
  type DemoRequest, 
  type InsertDemoRequest,
  type Project,
  type InsertProject,
  type Product,
  type InsertProduct,
  type InvestorProfile,
  type InsertInvestorProfile,
  type UserRole
} from "@shared/schema";

export interface IStorage {
  // User authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;
  
  // Demo requests (legacy)
  createDemoRequest(demoRequest: InsertDemoRequest): Promise<DemoRequest>;
  getDemoRequest(id: number): Promise<DemoRequest | undefined>;
  updateDemoRequest(id: number, updates: Partial<DemoRequest>): Promise<DemoRequest | undefined>;
  
  // Projects (for production companies)
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  publishProject(id: number): Promise<Project | undefined>;
  getPublishedProjects(): Promise<Project[]>;
  
  // Products (for brands/agencies)
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByBrand(brandUserId: number): Promise<Product[]>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Investor profiles
  createInvestorProfile(profile: InsertInvestorProfile): Promise<InvestorProfile>;
  getInvestorProfile(userId: number): Promise<InvestorProfile | undefined>;
  updateInvestorProfile(userId: number, updates: Partial<InvestorProfile>): Promise<InvestorProfile | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private demoRequests: Map<number, DemoRequest>;
  private projects: Map<number, Project>;
  private products: Map<number, Product>;
  private investorProfiles: Map<number, InvestorProfile>;
  
  private currentUserId: number;
  private currentDemoRequestId: number;
  private currentProjectId: number;
  private currentProductId: number;
  private currentInvestorProfileId: number;

  constructor() {
    this.users = new Map();
    this.demoRequests = new Map();
    this.projects = new Map();
    this.products = new Map();
    this.investorProfiles = new Map();
    
    this.currentUserId = 1;
    this.currentDemoRequestId = 1;
    this.currentProjectId = 1;
    this.currentProductId = 1;
    this.currentInvestorProfileId = 1;
  }

  // User authentication methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
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
      companyType: insertDemoRequest.companyType,
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
