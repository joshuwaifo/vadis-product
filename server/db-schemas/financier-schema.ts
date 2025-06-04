import { pgTable, serial, text, timestamp, boolean, integer, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Financier Users
export const financierUsers = pgTable("financier_users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financier Profiles
export const financierProfiles = pgTable("financier_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => financierUsers.id).notNull(),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
  description: text("description"),
  investmentFocus: jsonb("investment_focus").$type<string[]>(),
  portfolioSize: text("portfolio_size"),
  typicalInvestment: text("typical_investment"),
  preferredGenres: jsonb("preferred_genres").$type<string[]>(),
  riskTolerance: text("risk_tolerance"), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investment Opportunities
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  financierUserId: integer("financier_user_id").references(() => financierUsers.id).notNull(),
  projectTitle: text("project_title").notNull(),
  genre: text("genre"),
  estimatedBudget: decimal("estimated_budget", { precision: 12, scale: 2 }),
  requestedAmount: decimal("requested_amount", { precision: 12, scale: 2 }),
  expectedRoi: decimal("expected_roi", { precision: 5, scale: 2 }), // percentage
  riskLevel: text("risk_level"), // 'low', 'medium', 'high'
  projectStatus: text("project_status"), // 'pre-production', 'production', 'post-production'
  investmentStage: text("investment_stage"), // 'seed', 'development', 'production', 'distribution'
  status: text("status").default("reviewing"), // 'reviewing', 'interested', 'declined', 'invested'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio Tracking
export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  financierUserId: integer("financier_user_id").references(() => financierUsers.id).notNull(),
  projectTitle: text("project_title").notNull(),
  investmentAmount: decimal("investment_amount", { precision: 12, scale: 2 }),
  investmentDate: timestamp("investment_date"),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }),
  status: text("status"), // 'active', 'completed', 'defaulted'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertFinancierUser = createInsertSchema(financierUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinancierProfile = createInsertSchema(financierProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestment = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolio = createInsertSchema(portfolio).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type FinancierUser = typeof financierUsers.$inferSelect;
export type InsertFinancierUser = z.infer<typeof insertFinancierUser>;
export type FinancierProfile = typeof financierProfiles.$inferSelect;
export type InsertFinancierProfile = z.infer<typeof insertFinancierProfile>;
export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestment>;
export type Portfolio = typeof portfolio.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolio>;