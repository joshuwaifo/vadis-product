import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authenticated users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role"), // production, brand, financier, creator
  roleAssignedAt: timestamp("role_assigned_at"),
  businessEmail: varchar("business_email"),
  businessEmailVerified: boolean("business_email_verified").default(false),
  isIndividualFinancier: boolean("is_individual_financier").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

// User schemas for Replit Auth
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  roleAssignedAt: true,
  businessEmail: true,
  businessEmailVerified: true,
  isIndividualFinancier: true,
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

// User role enum
export const userRoles = ["production", "brand", "financier", "creator"] as const;
export type UserRole = typeof userRoles[number];

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;
