
import { db } from "./db";
import {
  draws,
  type InsertDraw,
  type Draw,
  type DrawResponse,
  getDrawType
} from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  getDraws(limit?: number): Promise<DrawResponse[]>;
  createDraw(draw: InsertDraw): Promise<DrawResponse>;
  getLatestDraw(): Promise<DrawResponse | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getDraws(limit: number = 100): Promise<DrawResponse[]> {
    const results = await db.select()
      .from(draws)
      .orderBy(desc(draws.createdAt))
      .limit(limit);
      
    return results.map(d => ({
      ...d,
      resultType: getDrawType(d.value)
    }));
  }

  async createDraw(insertDraw: InsertDraw): Promise<DrawResponse> {
    const [draw] = await db.insert(draws)
      .values(insertDraw)
      .returning();
      
    return {
      ...draw,
      resultType: getDrawType(draw.value)
    };
  }

  async getLatestDraw(): Promise<DrawResponse | undefined> {
    const [draw] = await db.select()
      .from(draws)
      .orderBy(desc(draws.createdAt))
      .limit(1);
      
    if (!draw) return undefined;
    
    return {
      ...draw,
      resultType: getDrawType(draw.value)
    };
  }
}

export const storage = new DatabaseStorage();
