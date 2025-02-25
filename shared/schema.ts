import { pgTable, text, serial, integer, boolean, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced User table with admin capabilities
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverImageUrl: text("cover_image_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  role: text("role").default("user").notNull(), // user, moderator, content_manager, admin
  permissions: jsonb("permissions").$type<string[]>(), // Array of permission strings
  lastLoginAt: timestamp("last_login_at"),
  status: text("status").default("active").notNull(), // active, suspended, banned
  location: text("location"),
  website: text("website"),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Enhanced posts table for social media
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<{
    type: "image" | "video" | "audio" | "link";
    url: string;
    thumbnailUrl?: string;
  }[]>(),
  visibility: text("visibility").default("public").notNull(), // public, friends, private
  likes: integer("likes").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  hashtags: text("hashtags").array(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at")
});

// Stories feature (Instagram-like)
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(), // image, video
  caption: text("caption"),
  viewers: integer("viewers").default(0).notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 24 hours from creation
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Direct messaging
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // direct, group
  name: text("name"), // for group conversations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull()
});

export const conversationMembers = pgTable("conversation_members", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").default("member").notNull(), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<{
    type: "image" | "video" | "audio" | "file";
    url: string;
    name?: string;
  }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false).notNull()
});

// Comments with threading support
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  parentId: integer("parent_id"), // for threaded comments
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at")
});

// Enhanced follows table with relationship status
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  status: text("status").default("pending").notNull(), // pending, accepted
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Enhanced follows table with relationship status
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull(),
  user2Id: integer("user2_id").notNull(),
  status: text("status").default("active").notNull(), // active, blocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

// Communities/Groups
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  coverImageUrl: text("cover_image_url"),
  type: text("type").default("public").notNull(), // public, private, restricted
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").default("member").notNull(), // owner, moderator, member
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

// Enhanced movies table with moderation and analytics
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  trailerUrl: text("trailer_url"),
  type: text("type").default("movie").notNull(), // movie, series
  duration: integer("duration").notNull(), // in seconds
  uploaderId: integer("uploader_id").notNull(),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  moderationStatus: text("moderation_status").default("pending").notNull(), // pending, approved, flagged, rejected
  moderationNotes: text("moderation_notes"),
  moderatorId: integer("moderator_id"),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  averageRating: integer("average_rating").default(0), // 1-5 stars
  totalRatings: integer("total_ratings").default(0),
  averageWatchTime: integer("average_watch_time").default(0), // in seconds
  revenue: integer("revenue").default(0), // in cents
  metadata: jsonb("metadata").$type<{
    genre?: string[];
    cast?: string[];
    director?: string;
    releaseYear?: number;
    language?: string;
    subtitles?: { language: string; url: string }[];
    contentRating?: string;
    aiTags?: string[];
    awards?: string[];
    productionStudio?: string;
    similar?: number[]; // Array of similar movie IDs
    copyrightInfo?: {
      owner?: string;
      status?: "cleared" | "pending" | "flagged";
      notes?: string;
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

// Add movie ratings table
export const movieRatings = pgTable("movie_ratings", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

// Add watch history table
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull(),
  userId: integer("user_id").notNull(),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
  watchDuration: integer("watch_duration").notNull(), // in seconds
  completed: boolean("completed").default(false).notNull(),
  lastPosition: integer("last_position").default(0).notNull() // in seconds
});

// Analytics tracking
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // movie, post, user
  entityId: integer("entity_id").notNull(),
  metric: text("metric").notNull(), // views, likes, shares, revenue
  value: integer("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// Content moderation queue
export const moderationQueue = pgTable("moderation_queue", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // movie, post, comment
  contentId: integer("content_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending").notNull(), // pending, reviewed, actioned
  moderatorId: integer("moderator_id"),
  moderatorNotes: text("moderator_notes"),
  action: text("action"), // approve, reject, flag
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

// Revenue tracking
export const revenue = pgTable("revenue", {
  id: serial("id").primaryKey(),
  sourceType: text("source_type").notNull(), // subscription, ad, ppv
  sourceId: integer("source_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("USD").notNull(),
  status: text("status").default("pending").notNull(), // pending, completed, failed
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Update the insert movie schema
export const insertMovieSchema = createInsertSchema(movies).pick({
  title: true,
  description: true,
  videoUrl: true,
  thumbnailUrl: true,
  trailerUrl: true,
  type: true,
  duration: true,
  metadata: true
}).extend({
  type: z.enum(['movie', 'series']).default('movie'),
  metadata: z.object({
    genre: z.array(z.string()).optional(),
    cast: z.array(z.string()).optional(),
    director: z.string().optional(),
    releaseYear: z.number().optional(),
    language: z.string().optional(),
    subtitles: z.array(z.object({
      language: z.string(),
      url: z.string()
    })).optional(),
    contentRating: z.string().optional(),
    aiTags: z.array(z.string()).optional(),
    awards: z.array(z.string()).optional(),
    productionStudio: z.string().optional(),
    similar: z.array(z.number()).optional(),
    copyrightInfo: z.object({
      owner: z.string().optional(),
      status: z.enum(['cleared', 'pending', 'flagged']).optional(),
      notes: z.string().optional()
    }).optional()
  }).optional()
});

// Add rating schema
export const movieRatingSchema = createInsertSchema(movieRatings).pick({
  rating: true,
  review: true
});

// Add friend request schema
export const insertFriendRequestSchema = createInsertSchema(friendRequests).pick({
  receiverId: true,
  message: true
});

// Add types
export type MovieRating = typeof movieRatings.$inferSelect;
export type InsertMovieRating = z.infer<typeof movieRatingSchema>;
export type WatchHistory = typeof watchHistory.$inferSelect;
export type FriendRequest = typeof friendRequests.$inferSelect;
export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type Friendship = typeof friendships.$inferSelect;


// Update the insert schema to include optional googleId
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  permissions: true,
  displayName: true,
  avatarUrl: true,
  googleId: true,
}).extend({
  role: z.enum(['user', 'moderator', 'content_manager', 'admin']).default('user'),
  permissions: z.array(z.string()).optional(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
  googleId: z.string().optional()
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  displayName: true,
  bio: true,
  avatarUrl: true,
  coverImageUrl: true,
  location: true,
  website: true
});

export const insertPostSchema = createInsertSchema(posts).pick({
  content: true,
  attachments: true,
  visibility: true,
  location: true
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  parentId: true
});

export const insertStorySchema = createInsertSchema(stories).pick({
  mediaUrl: true,
  mediaType: true,
  caption: true
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  attachments: true
});

export const insertCommunitySchema = createInsertSchema(communities).pick({
  name: true,
  description: true,
  type: true
});


export const insertModerationQueueSchema = createInsertSchema(moderationQueue).pick({
  contentType: true,
  contentId: true,
  reason: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type ModerationQueue = typeof moderationQueue.$inferSelect;
export type InsertModerationQueue = z.infer<typeof insertModerationQueueSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type Revenue = typeof revenue.$inferSelect;