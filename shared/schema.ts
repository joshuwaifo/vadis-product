import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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

// Projects table for production companies
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  logline: text("logline"),
  targetGenres: text("target_genres").array(),
  synopsis: text("synopsis"),
  scriptContent: text("script_content"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Role-specific signup schemas
export const productionSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  companyName: z.string().min(1),
  contactPerson: z.string().min(1),
  companyWebsite: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const brandSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  brandName: z.string().min(1),
  contactPerson: z.string().min(1),
  companyWebsite: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const investorSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  fullName: z.string().min(1),
  investmentType: z.enum(["ROI-based Equity", "Loan-based Debt"]),
  structure: z.enum(["Individual", "Team/Fund"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const creatorSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  fullName: z.string().min(1),
  platformLink: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertInvestorProfile = z.infer<typeof insertInvestorProfileSchema>;
export type InvestorProfile = typeof investorProfiles.$inferSelect;
export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;

export type UserRole = keyof typeof userRoles;
export type ProductionSignup = z.infer<typeof productionSignupSchema>;
export type BrandSignup = z.infer<typeof brandSignupSchema>;
export type InvestorSignup = z.infer<typeof investorSignupSchema>;
export type CreatorSignup = z.infer<typeof creatorSignupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
