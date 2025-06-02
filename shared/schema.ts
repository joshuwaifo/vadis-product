import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoles = {
  PRODUCTION: "PRODUCTION",
  BRAND_AGENCY: "BRAND_AGENCY", 
  INVESTOR: "INVESTOR",
  INDIVIDUAL_CREATOR: "INDIVIDUAL_CREATOR"
} as const;

// Updated users table for multi-role authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // PRODUCTION, BRAND_AGENCY, INVESTOR, INDIVIDUAL_CREATOR
  roleSpecificDetails: jsonb("role_specific_details"), // For storing role-specific signup info
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production company profiles
export const productionProfiles = pgTable("production_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  website: text("website"),
  description: text("description"),
  // Private billing information
  billingAddress: text("billing_address"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingCountry: text("billing_country"),
  billingZip: text("billing_zip"),
  // Payment information (stored securely)
  paymentMethodId: text("payment_method_id"), // Stripe payment method ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced projects table for production companies
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  projectType: text("project_type").notNull(), // "script_analysis" or "script_generator"
  logline: text("logline"),
  targetGenres: text("target_genres").array(),
  synopsis: text("synopsis"),
  scriptContent: text("script_content"),
  status: text("status").default("draft"), // draft, in_progress, completed, published
  isPublished: boolean("is_published").default(false),
  
  // Financial information for investor marketplace
  budgetRange: text("budget_range"), // e.g., "$1M-$5M"
  fundingGoal: integer("funding_goal"), // Target funding amount
  fundingRaised: integer("funding_raised").default(0), // Amount raised so far
  projectedROI: text("projected_roi"), // Expected return on investment
  investmentTerms: text("investment_terms"), // Investment structure details
  
  // Project details
  productionTimeline: text("production_timeline"),
  keyTalent: jsonb("key_talent"), // Array of key talent involved
  distributionPlan: text("distribution_plan"),
  marketAnalysis: text("market_analysis"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Script Analysis Tables
export const scenes = pgTable("scenes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  sceneNumber: integer("scene_number").notNull(),
  location: text("location").notNull(),
  timeOfDay: text("time_of_day"),
  description: text("description"),
  characters: text("characters").array(),
  content: text("content"),
  pageStart: integer("page_start"),
  pageEnd: integer("page_end"),
  duration: integer("duration"), // estimated minutes
  vfxNeeds: text("vfx_needs").array(),
  productPlacementOpportunities: text("product_placement_opportunities").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  age: text("age"),
  gender: text("gender"),
  personality: text("personality").array(),
  importance: text("importance"), // 'lead', 'supporting', 'minor'
  screenTime: integer("screen_time"), // estimated minutes
  characterArc: text("character_arc"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const characterRelationships = pgTable("character_relationships", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  fromCharacter: text("from_character").notNull(),
  toCharacter: text("to_character").notNull(),
  relationship: text("relationship").notNull(),
  strength: integer("strength"), // 1-10
  createdAt: timestamp("created_at").defaultNow(),
});

export const actorSuggestions = pgTable("actor_suggestions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  characterName: text("character_name").notNull(),
  actorName: text("actor_name").notNull(),
  reasoning: text("reasoning"),
  fitScore: integer("fit_score"), // 1-100
  availability: text("availability"),
  estimatedFee: text("estimated_fee"),
  workingRelationships: text("working_relationships").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vfxNeeds = pgTable("vfx_needs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  sceneId: integer("scene_id").references(() => scenes.id),
  vfxType: text("vfx_type").notNull(),
  complexity: text("complexity"), // 'low', 'medium', 'high', 'extreme'
  estimatedCost: integer("estimated_cost"),
  description: text("description"),
  referenceImages: text("reference_images").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productPlacements = pgTable("product_placements", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  sceneId: integer("scene_id").references(() => scenes.id),
  brand: text("brand").notNull(),
  product: text("product").notNull(),
  placement: text("placement"),
  naturalness: integer("naturalness"), // 1-10
  visibility: text("visibility"), // 'background', 'featured', 'hero'
  estimatedValue: integer("estimated_value"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const locationSuggestions = pgTable("location_suggestions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  sceneId: integer("scene_id").references(() => scenes.id),
  locationType: text("location_type").notNull(),
  location: text("location").notNull(),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  taxIncentive: integer("tax_incentive"), // percentage
  estimatedCost: integer("estimated_cost"),
  logistics: text("logistics"),
  weatherConsiderations: text("weather_considerations"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financialPlans = pgTable("financial_plans", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  totalBudget: integer("total_budget"),
  preProductionBudget: integer("pre_production_budget"),
  productionBudget: integer("production_budget"),
  postProductionBudget: integer("post_production_budget"),
  marketingBudget: integer("marketing_budget"),
  contingencyBudget: integer("contingency_budget"),
  domesticRevenue: integer("domestic_revenue"),
  internationalRevenue: integer("international_revenue"),
  streamingRevenue: integer("streaming_revenue"),
  merchandiseRevenue: integer("merchandise_revenue"),
  productPlacementRevenue: integer("product_placement_revenue"),
  roi: text("roi"),
  breakEvenPoint: integer("break_even_point"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table for brands/agencies
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  brandUserId: integer("brand_user_id").notNull(),
  productName: text("product_name").notNull(),
  companyName: text("company_name").notNull(),
  category: text("category"),
  imageUrl: text("image_url"),
  description: text("description"),
  placementCriteria: text("placement_criteria"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investor profiles table
export const investorProfiles = pgTable("investor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  investmentType: text("investment_type"), // ROI-based Equity, Loan-based Debt
  structure: text("structure"), // Individual, Team/Fund
  preferredGenres: jsonb("preferred_genres"), // Array of genres
  minInvestment: integer("min_investment"),
  maxInvestment: integer("max_investment"),
  otherCriteria: text("other_criteria"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Demo requests table (keeping existing for backward compatibility)
export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  companyName: text("company_name").notNull(),
  companyType: text("company_type").notNull(),
  companySize: text("company_size"),
  jobTitle: text("job_title"),
  department: text("department"),
  industry: text("industry"),
  useCase: text("use_case"),
  challenges: text("challenges"),
  timeline: text("timeline"),
  budget: text("budget"),
  hearAboutUs: text("hear_about_us"),
  hubspotContactId: text("hubspot_contact_id"),
  hubspotDealId: text("hubspot_deal_id"),
  calendlyEventId: text("calendly_event_id"),
  status: text("status").default("submitted"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  passwordHash: true,
  role: true,
  roleSpecificDetails: true,
});

export const insertProductionProfileSchema = createInsertSchema(productionProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestorProfileSchema = createInsertSchema(investorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).omit({
  id: true,
  hubspotContactId: true,
  hubspotDealId: true,
  calendlyEventId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSceneSchema = createInsertSchema(scenes).omit({
  id: true,
  createdAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export const insertCharacterRelationshipSchema = createInsertSchema(characterRelationships).omit({
  id: true,
  createdAt: true,
});

// Login schema for authentication

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProductionProfile = z.infer<typeof insertProductionProfileSchema>;
export type ProductionProfile = typeof productionProfiles.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertInvestorProfile = z.infer<typeof insertInvestorProfileSchema>;
export type InvestorProfile = typeof investorProfiles.$inferSelect;
export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertScene = z.infer<typeof insertSceneSchema>;
export type Scene = typeof scenes.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;
export type InsertCharacterRelationship = z.infer<typeof insertCharacterRelationshipSchema>;
export type CharacterRelationship = typeof characterRelationships.$inferSelect;

export type UserRole = keyof typeof userRoles;
export type LoginData = z.infer<typeof loginSchema>;
