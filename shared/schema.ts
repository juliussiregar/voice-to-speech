import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Add text-to-speech conversion history table
export const ttsConversions = pgTable("tts_conversions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  voiceType: text("voice_type").notNull(),
  speechSpeed: numeric("speech_speed").notNull(),
  audioUrl: text("audio_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTtsConversionSchema = createInsertSchema(ttsConversions)
  .pick({
    text: true,
    voiceType: true,
    speechSpeed: true,
    audioUrl: true,
  });

// Text-to-speech request schema
export const ttsRequestSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000, "Text must be less than 5000 characters"),
  voiceType: z.string(),
  speechSpeed: z.number().min(0.5).max(2.0),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTtsConversion = z.infer<typeof insertTtsConversionSchema>;
export type TtsConversion = typeof ttsConversions.$inferSelect;
export type TtsRequest = z.infer<typeof ttsRequestSchema>;
