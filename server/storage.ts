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
      id,
      email: insertUser.email,
      passwordHash: insertUser.passwordHash,
      role: insertUser.role,
      roleSpecificDetails: insertUser.roleSpecificDetails ?? null,
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

  // Demo requests (legacy - keeping for backward compatibility)
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

  // Project methods (for production companies)
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: Project = {
      id,
      userId: insertProject.userId,
      title: insertProject.title,
      logline: insertProject.logline ?? null,
      targetGenres: insertProject.targetGenres ?? null,
      synopsis: insertProject.synopsis ?? null,
      scriptContent: insertProject.scriptContent ?? null,
      isPublished: insertProject.isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async publishProject(id: number): Promise<Project | undefined> {
    return this.updateProject(id, { isPublished: true });
  }

  async getPublishedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.isPublished);
  }

  // Product methods (for brands/agencies)
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const now = new Date();
    const product: Product = {
      id,
      brandUserId: insertProduct.brandUserId,
      productName: insertProduct.productName,
      companyName: insertProduct.companyName,
      category: insertProduct.category ?? null,
      imageUrl: insertProduct.imageUrl ?? null,
      description: insertProduct.description ?? null,
      placementCriteria: insertProduct.placementCriteria ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(id, product);
    return product;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByBrand(brandUserId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.brandUserId === brandUserId);
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated: Product = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Investor profile methods
  async createInvestorProfile(insertProfile: InsertInvestorProfile): Promise<InvestorProfile> {
    const id = this.currentInvestorProfileId++;
    const now = new Date();
    const profile: InvestorProfile = {
      id,
      userId: insertProfile.userId,
      investmentType: insertProfile.investmentType ?? null,
      structure: insertProfile.structure ?? null,
      preferredGenres: insertProfile.preferredGenres ?? null,
      minInvestment: insertProfile.minInvestment ?? null,
      maxInvestment: insertProfile.maxInvestment ?? null,
      otherCriteria: insertProfile.otherCriteria ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.investorProfiles.set(id, profile);
    return profile;
  }

  async getInvestorProfile(userId: number): Promise<InvestorProfile | undefined> {
    return Array.from(this.investorProfiles.values()).find(profile => profile.userId === userId);
  }

  async updateInvestorProfile(userId: number, updates: Partial<InvestorProfile>): Promise<InvestorProfile | undefined> {
    const existing = await this.getInvestorProfile(userId);
    if (!existing) return undefined;
    
    const updated: InvestorProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.investorProfiles.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
