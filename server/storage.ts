import { db } from "./db";
import { rateLimits, dailyUsage, topicSearches, emailSubscribers, type InsertTopicSearch, type InsertEmailSubscriber } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Rate limiting
  getUserGenerationCount(userHash: string, dateKey: string): Promise<number>;
  incrementUserGenerationCount(userHash: string, dateKey: string): Promise<void>;
  getDailyGlobalCount(dateKey: string): Promise<number>;
  incrementDailyGlobalCount(dateKey: string): Promise<void>;
  
  // Topic analytics
  recordTopicSearch(data: InsertTopicSearch): Promise<void>;
  getTopTopics(limit?: number): Promise<Array<{ topic: string; count: number }>>;
  getTotalSearchCount(): Promise<number>;

  // Email subscribers
  addEmailSubscriber(data: InsertEmailSubscriber): Promise<void>;
  getEmailSubscriberCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUserGenerationCount(userHash: string, dateKey: string): Promise<number> {
    const result = await db
      .select({ generationCount: rateLimits.generationCount })
      .from(rateLimits)
      .where(and(eq(rateLimits.userHash, userHash), eq(rateLimits.dateKey, dateKey)));
    
    return result[0]?.generationCount ?? 0;
  }

  async incrementUserGenerationCount(userHash: string, dateKey: string): Promise<void> {
    const existing = await db
      .select()
      .from(rateLimits)
      .where(and(eq(rateLimits.userHash, userHash), eq(rateLimits.dateKey, dateKey)));
    
    if (existing.length > 0) {
      await db
        .update(rateLimits)
        .set({ generationCount: sql`${rateLimits.generationCount} + 1` })
        .where(and(eq(rateLimits.userHash, userHash), eq(rateLimits.dateKey, dateKey)));
    } else {
      await db.insert(rateLimits).values({
        userHash,
        dateKey,
        generationCount: 1,
      });
    }
  }

  async getDailyGlobalCount(dateKey: string): Promise<number> {
    const result = await db
      .select({ totalGenerations: dailyUsage.totalGenerations })
      .from(dailyUsage)
      .where(eq(dailyUsage.dateKey, dateKey));
    
    return result[0]?.totalGenerations ?? 0;
  }

  async incrementDailyGlobalCount(dateKey: string): Promise<void> {
    const existing = await db
      .select()
      .from(dailyUsage)
      .where(eq(dailyUsage.dateKey, dateKey));
    
    if (existing.length > 0) {
      await db
        .update(dailyUsage)
        .set({ totalGenerations: sql`${dailyUsage.totalGenerations} + 1` })
        .where(eq(dailyUsage.dateKey, dateKey));
    } else {
      await db.insert(dailyUsage).values({
        dateKey,
        totalGenerations: 1,
      });
    }
  }

  async recordTopicSearch(data: InsertTopicSearch): Promise<void> {
    await db.insert(topicSearches).values(data);
  }

  async getTopTopics(limit = 20): Promise<Array<{ topic: string; count: number }>> {
    const result = await db
      .select({
        topic: topicSearches.topic,
        count: sql<number>`count(*)::int`,
      })
      .from(topicSearches)
      .groupBy(topicSearches.topic)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
    
    return result;
  }

  async getTotalSearchCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(topicSearches);
    
    return result[0]?.count ?? 0;
  }
  async addEmailSubscriber(data: InsertEmailSubscriber): Promise<void> {
    await db.insert(emailSubscribers).values(data);
  }

  async getEmailSubscriberCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailSubscribers);
    return result[0]?.count ?? 0;
  }
}

export const storage = new DatabaseStorage();
