import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Production Company Users
export const productionUsers = pgTable("production_users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production Company Profiles
export const productionProfiles = pgTable("production_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => productionUsers.id).notNull(),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
  description: text("description"),
  foundedYear: integer("founded_year"),
  location: text("location"),
  genres: jsonb("genres").$type<string[]>(),
  notableProjects: jsonb("notable_projects").$type<string[]>(),
  teamSize: integer("team_size"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects for Production Companies
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => productionUsers.id).notNull(),
  title: text("title").notNull(),
  projectType: text("project_type").notNull(), // 'script_analysis', 'script_generator'
  logline: text("logline"),
  synopsis: text("synopsis"),
  scriptContent: text("script_content"),
  status: text("status").default("draft"), // 'draft', 'analyzing', 'ready', 'published'
  targetGenres: jsonb("target_genres").$type<string[]>(),
  estimatedBudget: integer("estimated_budget"),
  targetReleaseDate: timestamp("target_release_date"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scenes for Script Analysis
export const scenes = pgTable("scenes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  sceneNumber: integer("scene_number").notNull(),
  location: text("location").notNull(),
  timeOfDay: text("time_of_day"),
  description: text("description"),
  characters: jsonb("characters").$type<string[]>(),
  content: text("content"),
  duration: integer("duration"), // estimated minutes
  vfxNeeds: jsonb("vfx_needs").$type<string[]>(),
  productPlacementOpportunities: jsonb("product_placement_opportunities").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Characters for Script Analysis
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  age: text("age"),
  gender: text("gender"),
  personality: jsonb("personality").$type<string[]>(),
  importance: text("importance"), // 'lead', 'supporting', 'minor'
  screenTime: integer("screen_time"), // estimated minutes
  characterArc: text("character_arc"),
  physicalDescription: text("physical_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertProductionUser = createInsertSchema(productionUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductionProfile = createInsertSchema(productionProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProject = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScene = createInsertSchema(scenes).omit({
  id: true,
  createdAt: true,
});

export const insertCharacter = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

// Types
export type ProductionUser = typeof productionUsers.$inferSelect;
export type InsertProductionUser = z.infer<typeof insertProductionUser>;
export type ProductionProfile = typeof productionProfiles.$inferSelect;
export type InsertProductionProfile = z.infer<typeof insertProductionProfile>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProject>;
export type Scene = typeof scenes.$inferSelect;
export type InsertScene = z.infer<typeof insertScene>;
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacter>;