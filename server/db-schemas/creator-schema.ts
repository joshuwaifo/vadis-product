import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Individual Creator Users
export const creatorUsers = pgTable("creator_users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Creator Profiles
export const creatorProfiles = pgTable("creator_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => creatorUsers.id).notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  website: text("website"),
  location: text("location"),
  specializations: jsonb("specializations").$type<string[]>(), // 'screenwriter', 'director', 'producer'
  preferredGenres: jsonb("preferred_genres").$type<string[]>(),
  experienceLevel: text("experience_level"), // 'beginner', 'intermediate', 'advanced', 'professional'
  portfolio: jsonb("portfolio").$type<{ title: string; role: string; year: number }[]>(),
  socialLinks: jsonb("social_links").$type<{ platform: string; url: string }[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Creator Scripts/Projects
export const creatorProjects = pgTable("creator_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => creatorUsers.id).notNull(),
  title: text("title").notNull(),
  projectType: text("project_type").notNull(), // 'script_analysis', 'script_generator'
  logline: text("logline"),
  synopsis: text("synopsis"),
  scriptContent: text("script_content"),
  status: text("status").default("draft"), // 'draft', 'analyzing', 'ready', 'published'
  genre: text("genre"),
  targetAudience: text("target_audience"),
  isPublic: boolean("is_public").default(false),
  featuredOnMarketplace: boolean("featured_on_marketplace").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collaboration Requests
export const collaborations = pgTable("collaborations", {
  id: serial("id").primaryKey(),
  creatorUserId: integer("creator_user_id").references(() => creatorUsers.id).notNull(),
  projectId: integer("project_id").references(() => creatorProjects.id).notNull(),
  collaboratorType: text("collaborator_type").notNull(), // 'production', 'brand', 'financier', 'creator'
  message: text("message"),
  status: text("status").default("pending"), // 'pending', 'accepted', 'declined'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertCreatorUser = createInsertSchema(creatorUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreatorProfile = createInsertSchema(creatorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreatorProject = createInsertSchema(creatorProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCollaboration = createInsertSchema(collaborations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type CreatorUser = typeof creatorUsers.$inferSelect;
export type InsertCreatorUser = z.infer<typeof insertCreatorUser>;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type InsertCreatorProfile = z.infer<typeof insertCreatorProfile>;
export type CreatorProject = typeof creatorProjects.$inferSelect;
export type InsertCreatorProject = z.infer<typeof insertCreatorProject>;
export type Collaboration = typeof collaborations.$inferSelect;
export type InsertCollaboration = z.infer<typeof insertCollaboration>;