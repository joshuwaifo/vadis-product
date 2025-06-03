import bcrypt from "bcryptjs";
import { 
  users, 
  productionProfiles,
  demoRequests, 
  projects, 
  products, 
  investorProfiles,
  scenes,
  characters,
  characterRelationships,
  actorSuggestions,
  productPlacements,
  locationSuggestions,
  financialPlans,
  type User, 
  type InsertUser, 
  type ProductionProfile,
  type InsertProductionProfile,
  type DemoRequest, 
  type InsertDemoRequest,
  type Project,
  type InsertProject,
  type Product,
  type InsertProduct,
  type InvestorProfile,
  type InsertInvestorProfile,
  type Scene,
  type InsertScene,
  type Character,
  type InsertCharacter,
  type CharacterRelationship,
  type InsertCharacterRelationship,
  type ActorSuggestion,
  type InsertActorSuggestion,
  type ProductPlacement,
  type InsertProductPlacement,
  type LocationSuggestion,
  type InsertLocationSuggestion,
  type FinancialPlan,
  type InsertFinancialPlan,
  type UserRole
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;
  
  // Production company profiles
  createProductionProfile(profile: InsertProductionProfile): Promise<ProductionProfile>;
  getProductionProfile(userId: number): Promise<ProductionProfile | undefined>;
  updateProductionProfile(userId: number, updates: Partial<ProductionProfile>): Promise<ProductionProfile | undefined>;
  
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
  
  // Script Analysis - Scenes
  createScene(scene: InsertScene): Promise<Scene>;
  getScenesByProject(projectId: number): Promise<Scene[]>;
  
  // Script Analysis - Characters
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharactersByProject(projectId: number): Promise<Character[]>;
  
  // Script Analysis - Character Relationships
  createCharacterRelationship(relationship: InsertCharacterRelationship): Promise<CharacterRelationship>;
  getCharacterRelationshipsByProject(projectId: number): Promise<CharacterRelationship[]>;
  
  // Script Analysis - Actor Suggestions
  createActorSuggestion(suggestion: InsertActorSuggestion): Promise<ActorSuggestion>;
  
  // Script Analysis - Product Placements
  createProductPlacement(placement: InsertProductPlacement): Promise<ProductPlacement>;
  
  // Script Analysis - Location Suggestions
  createLocationSuggestion(suggestion: InsertLocationSuggestion): Promise<LocationSuggestion>;
  getLocationSuggestionsByProject(projectId: number): Promise<LocationSuggestion[]>;
  
  // Script Analysis - Financial Plans
  createFinancialPlan(plan: InsertFinancialPlan): Promise<FinancialPlan>;
}

// DEPRECATED: MemStorage class - kept for testing purposes only
// Use DatabaseStorage for all production operations
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private productionProfiles: Map<number, ProductionProfile>;
  private demoRequests: Map<number, DemoRequest>;
  private projects: Map<number, Project>;
  private products: Map<number, Product>;
  private investorProfiles: Map<number, InvestorProfile>;
  
  private currentUserId: number;
  private currentDemoRequestId: number;
  private currentProjectId: number;
  private currentProductId: number;
  private currentInvestorProfileId: number;
  private currentProductionProfileId: number;

  constructor() {
    this.users = new Map();
    this.productionProfiles = new Map();
    this.demoRequests = new Map();
    this.projects = new Map();
    this.products = new Map();
    this.investorProfiles = new Map();
    
    this.currentUserId = 1;
    this.currentDemoRequestId = 1;
    this.currentProjectId = 1;
    this.currentProductId = 1;
    this.currentInvestorProfileId = 1;
    this.currentProductionProfileId = 1;
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
      projectType: insertProject.projectType || "script_analysis",
      logline: insertProject.logline ?? null,
      targetGenres: insertProject.targetGenres ?? null,
      synopsis: insertProject.synopsis ?? null,
      scriptContent: insertProject.scriptContent ?? null,
      status: insertProject.status ?? "draft",
      budgetRange: insertProject.budgetRange ?? null,
      fundingGoal: insertProject.fundingGoal ?? null,
      fundingRaised: insertProject.fundingRaised ?? 0,
      projectedROI: insertProject.projectedROI ?? null,
      investmentTerms: insertProject.investmentTerms ?? null,
      productionTimeline: insertProject.productionTimeline ?? null,
      keyTalent: insertProject.keyTalent ?? null,
      distributionPlan: insertProject.distributionPlan ?? null,
      marketAnalysis: insertProject.marketAnalysis ?? null,
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

  // Production profile methods
  async createProductionProfile(insertProfile: InsertProductionProfile): Promise<ProductionProfile> {
    const id = this.currentProductionProfileId++;
    const now = new Date();
    const profile: ProductionProfile = {
      id,
      userId: insertProfile.userId,
      companyName: insertProfile.companyName,
      logoUrl: insertProfile.logoUrl || null,
      city: insertProfile.city || null,
      state: insertProfile.state || null,
      country: insertProfile.country || null,
      website: insertProfile.website || null,
      description: insertProfile.description || null,
      billingAddress: insertProfile.billingAddress || null,
      billingCity: insertProfile.billingCity || null,
      billingState: insertProfile.billingState || null,
      billingCountry: insertProfile.billingCountry || null,
      billingZip: insertProfile.billingZip || null,
      paymentMethodId: insertProfile.paymentMethodId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.productionProfiles.set(insertProfile.userId, profile);
    return profile;
  }

  async getProductionProfile(userId: number): Promise<ProductionProfile | undefined> {
    return this.productionProfiles.get(userId);
  }

  async updateProductionProfile(userId: number, updates: Partial<ProductionProfile>): Promise<ProductionProfile | undefined> {
    const existing = this.productionProfiles.get(userId);
    if (!existing) return undefined;
    
    const updated: ProductionProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.productionProfiles.set(userId, updated);
    return updated;
  }

  // Script Analysis - Scenes (stub implementation for deprecated MemStorage)
  async createScene(scene: InsertScene): Promise<Scene> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for scene operations.");
  }

  async getScenesByProject(projectId: number): Promise<Scene[]> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for scene operations.");
  }

  // Script Analysis - Characters (stub implementation for deprecated MemStorage)
  async createCharacter(character: InsertCharacter): Promise<Character> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for character operations.");
  }

  async getCharactersByProject(projectId: number): Promise<Character[]> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for character operations.");
  }

  // Script Analysis - Character Relationships (stub implementation for deprecated MemStorage)
  async createCharacterRelationship(relationship: InsertCharacterRelationship): Promise<CharacterRelationship> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for character relationship operations.");
  }

  async getCharacterRelationshipsByProject(projectId: number): Promise<CharacterRelationship[]> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for character relationship operations.");
  }

  // Script Analysis - Actor Suggestions (stub implementation for deprecated MemStorage)
  async createActorSuggestion(suggestion: InsertActorSuggestion): Promise<ActorSuggestion> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for actor suggestion operations.");
  }

  // Script Analysis - Product Placements (stub implementation for deprecated MemStorage)
  async createProductPlacement(placement: InsertProductPlacement): Promise<ProductPlacement> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for product placement operations.");
  }

  // Script Analysis - Location Suggestions (stub implementation for deprecated MemStorage)
  async createLocationSuggestion(suggestion: InsertLocationSuggestion): Promise<LocationSuggestion> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for location suggestion operations.");
  }

  // Script Analysis - Financial Plans (stub implementation for deprecated MemStorage)
  async createFinancialPlan(plan: InsertFinancialPlan): Promise<FinancialPlan> {
    throw new Error("MemStorage is deprecated. Use DatabaseStorage for financial plan operations.");
  }
}



export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user || !user.passwordHash) return null;
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      return isValid ? user : null;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async createDemoRequest(insertDemoRequest: InsertDemoRequest): Promise<DemoRequest> {
    const [demoRequest] = await db
      .insert(demoRequests)
      .values(insertDemoRequest)
      .returning();
    return demoRequest;
  }

  async getDemoRequest(id: number): Promise<DemoRequest | undefined> {
    const [demoRequest] = await db.select().from(demoRequests).where(eq(demoRequests.id, id));
    return demoRequest || undefined;
  }

  async updateDemoRequest(id: number, updates: Partial<DemoRequest>): Promise<DemoRequest | undefined> {
    const [updated] = await db
      .update(demoRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(demoRequests.id, id))
      .returning();
    return updated || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated || undefined;
  }

  async publishProject(id: number): Promise<Project | undefined> {
    return this.updateProject(id, { status: 'published' });
  }

  async getPublishedProjects(): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.status, 'published'));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByBrand(brandUserId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.brandUserId, brandUserId));
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  async createInvestorProfile(insertProfile: InsertInvestorProfile): Promise<InvestorProfile> {
    const [profile] = await db
      .insert(investorProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async getInvestorProfile(userId: number): Promise<InvestorProfile | undefined> {
    const [profile] = await db.select().from(investorProfiles).where(eq(investorProfiles.userId, userId));
    return profile || undefined;
  }

  async updateInvestorProfile(userId: number, updates: Partial<InvestorProfile>): Promise<InvestorProfile | undefined> {
    const [updated] = await db
      .update(investorProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(investorProfiles.userId, userId))
      .returning();
    return updated || undefined;
  }

  // Production profile methods
  async createProductionProfile(insertProfile: InsertProductionProfile): Promise<ProductionProfile> {
    const [profile] = await db
      .insert(productionProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async getProductionProfile(userId: number): Promise<ProductionProfile | undefined> {
    const [profile] = await db.select().from(productionProfiles).where(eq(productionProfiles.userId, userId));
    return profile || undefined;
  }

  async updateProductionProfile(userId: number, updates: Partial<ProductionProfile>): Promise<ProductionProfile | undefined> {
    const [updated] = await db
      .update(productionProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(productionProfiles.userId, userId))
      .returning();
    return updated || undefined;
  }

  // Script Analysis - Scenes
  async createScene(scene: InsertScene): Promise<Scene> {
    try {
      const [created] = await db
        .insert(scenes)
        .values(scene)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating scene:', error);
      throw error;
    }
  }

  async getScenesByProject(projectId: number): Promise<Scene[]> {
    try {
      const result = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, projectId));
      return result;
    } catch (error) {
      console.error('Error getting scenes by project:', error);
      return [];
    }
  }

  // Script Analysis - Characters
  async createCharacter(character: InsertCharacter): Promise<Character> {
    try {
      const [created] = await db
        .insert(characters)
        .values(character)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  async getCharactersByProject(projectId: number): Promise<Character[]> {
    try {
      const result = await db
        .select()
        .from(characters)
        .where(eq(characters.projectId, projectId));
      return result;
    } catch (error) {
      console.error('Error getting characters by project:', error);
      return [];
    }
  }

  // Script Analysis - Character Relationships
  async createCharacterRelationship(relationship: InsertCharacterRelationship): Promise<CharacterRelationship> {
    try {
      const [created] = await db
        .insert(characterRelationships)
        .values(relationship)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating character relationship:', error);
      throw error;
    }
  }

  async getCharacterRelationshipsByProject(projectId: number): Promise<CharacterRelationship[]> {
    try {
      const result = await db
        .select()
        .from(characterRelationships)
        .where(eq(characterRelationships.projectId, projectId));
      return result;
    } catch (error) {
      console.error('Error getting character relationships by project:', error);
      return [];
    }
  }

  // Script Analysis - Actor Suggestions
  async createActorSuggestion(suggestion: InsertActorSuggestion): Promise<ActorSuggestion> {
    try {
      const [created] = await db
        .insert(actorSuggestions)
        .values(suggestion)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating actor suggestion:', error);
      throw error;
    }
  }

  // Script Analysis - Product Placements
  async createProductPlacement(placement: InsertProductPlacement): Promise<ProductPlacement> {
    try {
      const [created] = await db
        .insert(productPlacements)
        .values(placement)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating product placement:', error);
      throw error;
    }
  }

  // Script Analysis - Location Suggestions
  async createLocationSuggestion(suggestion: InsertLocationSuggestion): Promise<LocationSuggestion> {
    try {
      const [created] = await db
        .insert(locationSuggestions)
        .values(suggestion)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating location suggestion:', error);
      throw error;
    }
  }

  // Script Analysis - Financial Plans
  async createFinancialPlan(plan: InsertFinancialPlan): Promise<FinancialPlan> {
    try {
      const [created] = await db
        .insert(financialPlans)
        .values(plan)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating financial plan:', error);
      throw error;
    }
  }
}

// Active storage implementation - uses PostgreSQL database
export const storage = new DatabaseStorage();
