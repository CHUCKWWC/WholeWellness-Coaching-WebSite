import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Content pages table
export const contentPages = pgTable("content_pages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  slug: varchar("slug").unique().notNull(),
  title: varchar("title").notNull(),
  content: text("content"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  isPublished: boolean("is_published").default(true),
  featuredImage: text("featured_image"),
  author: varchar("author").default("Admin"),
  pageType: varchar("page_type").default("page"), // page, blog, service
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content blocks table for modular content
export const contentBlocks = pgTable("content_blocks", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  pageId: integer("page_id").references(() => contentPages.id),
  blockType: varchar("block_type").notNull(), // hero, text, image, testimonial, cta
  title: varchar("title"),
  content: text("content"),
  imageUrl: text("image_url"),
  buttonText: varchar("button_text"),
  buttonUrl: text("button_url"),
  backgroundColor: varchar("background_color"),
  textColor: varchar("text_color"),
  order: integer("order").default(0),
  settings: jsonb("settings"), // Additional flexible settings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media library table
export const mediaLibrary = pgTable("media_library", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  category: varchar("category").default("general"), // testimonial, hero, service, resource
  uploadedBy: varchar("uploaded_by").default("Admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Navigation menu management
export const navigationMenus = pgTable("navigation_menus", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  label: varchar("label").notNull(),
  url: text("url").notNull(),
  parentId: integer("parent_id").references(() => navigationMenus.id),
  order: integer("order").default(0),
  isExternal: boolean("is_external").default(false),
  isActive: boolean("is_active").default(true),
  menuLocation: varchar("menu_location").default("main"), // main, footer, sidebar
  createdAt: timestamp("created_at").defaultNow(),
});

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  key: varchar("key").unique().notNull(),
  value: text("value"),
  type: varchar("type").default("text"), // text, boolean, json, number
  category: varchar("category").default("general"), // general, seo, contact, social
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertContentPageSchema = createInsertSchema(contentPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentBlockSchema = createInsertSchema(contentBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaSchema = createInsertSchema(mediaLibrary).omit({
  id: true,
  createdAt: true,
});

export const insertNavigationSchema = createInsertSchema(navigationMenus).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

// Type exports
export type ContentPage = typeof contentPages.$inferSelect;
export type InsertContentPage = z.infer<typeof insertContentPageSchema>;

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type InsertContentBlock = z.infer<typeof insertContentBlockSchema>;

export type MediaItem = typeof mediaLibrary.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaSchema>;

export type NavigationMenu = typeof navigationMenus.$inferSelect;
export type InsertNavigationMenu = z.infer<typeof insertNavigationSchema>;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;