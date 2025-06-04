import { pgTable, serial, text, timestamp, boolean, integer, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Brand/Agency Users
export const brandUsers = pgTable("brand_users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand/Agency Profiles
export const brandProfiles = pgTable("brand_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => brandUsers.id).notNull(),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
  description: text("description"),
  industry: text("industry"),
  targetDemographics: jsonb("target_demographics").$type<string[]>(),
  brandValues: jsonb("brand_values").$type<string[]>(),
  marketingBudget: integer("marketing_budget"),
  preferredGenres: jsonb("preferred_genres").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products for Product Placement
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  brandUserId: integer("brand_user_id").references(() => brandUsers.id).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  targetAudience: jsonb("target_audience").$type<string[]>(),
  placementTypes: jsonb("placement_types").$type<string[]>(), // 'background', 'featured', 'hero'
  budgetRange: text("budget_range"),
  brandGuidelines: text("brand_guidelines"),
  images: jsonb("images").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product Placement Opportunities
export const placementOpportunities = pgTable("placement_opportunities", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  projectTitle: text("project_title").notNull(),
  sceneDescription: text("scene_description"),
  placementType: text("placement_type"), // 'background', 'featured', 'hero'
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  naturalness: integer("naturalness"), // 1-10 scale
  visibility: text("visibility"),
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign Performance Tracking
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  brandUserId: integer("brand_user_id").references(() => brandUsers.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  targetAudience: jsonb("target_audience").$type<string[]>(),
  kpis: jsonb("kpis").$type<{ metric: string; target: number }[]>(),
  status: text("status").default("planning"), // 'planning', 'active', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertBrandUser = createInsertSchema(brandUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandProfile = createInsertSchema(brandProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProduct = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlacementOpportunity = createInsertSchema(placementOpportunities).omit({
  id: true,
  createdAt: true,
});

export const insertCampaign = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type BrandUser = typeof brandUsers.$inferSelect;
export type InsertBrandUser = z.infer<typeof insertBrandUser>;
export type BrandProfile = typeof brandProfiles.$inferSelect;
export type InsertBrandProfile = z.infer<typeof insertBrandProfile>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProduct>;
export type PlacementOpportunity = typeof placementOpportunities.$inferSelect;
export type InsertPlacementOpportunity = z.infer<typeof insertPlacementOpportunity>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaign>;