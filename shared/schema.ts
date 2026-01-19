
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const draws = pgTable("draws", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(), // 3-18
  // We can compute small/draw/large from value, but helper fields might be useful for simple queries if needed.
  // For now, we keep it simple and compute in application logic.
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertDrawSchema = createInsertSchema(draws).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

// Domain types
export type DrawResult = "small" | "draw" | "large";
export type Draw = typeof draws.$inferSelect;
export type InsertDraw = z.infer<typeof insertDrawSchema>;

// Request types
export type CreateDrawRequest = InsertDraw;

// Response types
export interface DrawResponse extends Draw {
  resultType: DrawResult;
}

export interface StatsResponse {
  totalDraws: number;
  small: { count: number; percentage: number; currentStreak: number };
  draw: { count: number; percentage: number; currentStreak: number };
  large: { count: number; percentage: number; currentStreak: number };
  last30Stats: {
    small: number; // percentage
    draw: number;
    large: number;
  };
}

export interface PredictionResponse {
  suggestion: DrawResult | null; // null if no suggestion meets criteria
  confidence: number;
  reasons: string[];
  filters: {
    streakSafe: boolean;
    regression: boolean;
    notExtreme: boolean;
  };
}

// === HELPER FUNCTIONS ===
export const getDrawType = (value: number): DrawResult => {
  if (value >= 3 && value <= 9) return "small";
  if (value >= 12 && value <= 18) return "large";
  return "draw";
};
