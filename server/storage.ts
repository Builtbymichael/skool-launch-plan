import { db } from "./db";
import { rateLimits, dailyUsage, topicSearches, plans, emailSubscribers, type InsertTopicSearch, type EmailSubscriber, type SavedPlan } from "@shared/schema";
import { eq, and, desc, isNull, gte, lte, sql } from "drizzle-orm";

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

  // Plans
  savePlan(topic: string, planJson: string): Promise<string>;
  getPlan(id: string): Promise<SavedPlan | undefined>;

  // Subscribers
  upsertSubscriber(email: string, topic: string | null, planId: string): Promise<EmailSubscriber>;
  advanceSubscriberStage(id: string, stage: number): Promise<void>;
  getActiveDripSubscribers(): Promise<EmailSubscriber[]>;
  unsubscribeByToken(token: string): Promise<boolean>;
  getSubscriberCount(): Promise<number>;
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

  // ----- Plans -----

  async savePlan(topic: string, planJson: string): Promise<string> {
    const result = await db.insert(plans).values({ topic, planJson }).returning({ id: plans.id });
    return result[0].id;
  }

  async getPlan(id: string): Promise<SavedPlan | undefined> {
    const result = await db.select().from(plans).where(eq(plans.id, id));
    return result[0];
  }

  // ----- Subscribers -----

  async upsertSubscriber(email: string, topic: string | null, planId: string): Promise<EmailSubscriber> {
    const normalized = email.trim().toLowerCase();
    const existing = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, normalized));
    if (existing.length > 0) {
      // Re-point their latest plan; don't reset their drip stage or resubscribe them
      await db
        .update(emailSubscribers)
        .set({ planId, topic })
        .where(eq(emailSubscribers.id, existing[0].id));
      return { ...existing[0], planId, topic };
    }
    const result = await db
      .insert(emailSubscribers)
      .values({ email: normalized, topic, planId, stage: 0 })
      .returning();
    return result[0];
  }

  async advanceSubscriberStage(id: string, stage: number): Promise<void> {
    await db
      .update(emailSubscribers)
      .set({ stage, lastEmailAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(emailSubscribers.id, id));
  }

  async getActiveDripSubscribers(): Promise<EmailSubscriber[]> {
    return db
      .select()
      .from(emailSubscribers)
      .where(and(isNull(emailSubscribers.unsubscribedAt), gte(emailSubscribers.stage, 1), lte(emailSubscribers.stage, 3)));
  }

  async unsubscribeByToken(token: string): Promise<boolean> {
    const result = await db
      .update(emailSubscribers)
      .set({ unsubscribedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(emailSubscribers.unsubscribeToken, token))
      .returning({ id: emailSubscribers.id });
    return result.length > 0;
  }

  async getSubscriberCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(emailSubscribers);
    return result[0]?.count ?? 0;
  }
}

export const storage = new DatabaseStorage();
