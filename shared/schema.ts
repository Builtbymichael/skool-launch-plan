import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Rate limiting - tracks generations per user per day
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userHash: text("user_hash").notNull(),
  dateKey: date("date_key").notNull(),
  generationCount: integer("generation_count").notNull().default(0),
});

// Daily global usage tracking
export const dailyUsage = pgTable("daily_usage", {
  dateKey: date("date_key").primaryKey(),
  totalGenerations: integer("total_generations").notNull().default(0),
});

// Topic analytics - stores searched topics for admin insights
export const topicSearches = pgTable("topic_searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: text("topic").notNull(),
  audienceLevel: text("audience_level"),
  background: text("background"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Email subscribers - stores emails for future marketing
export const emailSubscribers = pgTable("email_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  topic: text("topic"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Insert schemas
export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({
  id: true,
});

export const insertDailyUsageSchema = createInsertSchema(dailyUsage);

export const insertTopicSearchSchema = createInsertSchema(topicSearches).omit({
  id: true,
  createdAt: true,
});

export const insertEmailSubscriberSchema = createInsertSchema(emailSubscribers).omit({
  id: true,
  createdAt: true,
});

// Types
export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type DailyUsage = typeof dailyUsage.$inferSelect;
export type InsertDailyUsage = z.infer<typeof insertDailyUsageSchema>;
export type TopicSearch = typeof topicSearches.$inferSelect;
export type InsertTopicSearch = z.infer<typeof insertTopicSearchSchema>;
export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = z.infer<typeof insertEmailSubscriberSchema>;

// Form input schema for validation
export const planFormSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(200, "Topic too long"),
  outcome: z.string().min(3, "Outcome must be at least 3 characters").max(300, "Outcome too long"),
  audienceLevel: z.string().optional(),
  background: z.string().optional(),
});

export type PlanFormInput = z.infer<typeof planFormSchema>;

// Generated plan schema (matching AI output)
export const generatedPlanSchema = z.object({
  meta: z.object({
    topic: z.string(),
    outcome_30_90: z.string(),
    audience_level: z.string(),
    background: z.string(),
    recommended_path: z.enum(["community", "course", "community_plus_course"]),
  }),
  positioning: z.object({
    community_name_options: z.array(z.string()),
    one_liner: z.string(),
    who_its_for: z.array(z.string()),
    who_its_not_for: z.array(z.string()),
    transformation_promise: z.string(),
  }),
  offer: z.object({
    format_explainer: z.string(),
    weekly_structure: z.object({
      cadence: z.string(),
      weekly_events: z.array(z.string()),
      weekly_posts: z.array(z.string()),
      accountability_loop: z.string(),
    }),
    example_modules_or_themes: z.array(z.string()),
    content_types: z.array(z.string()),
    engagement_loops: z.array(z.string()),
  }),
  first_20_members: z.object({
    where_to_find_them: z.array(z.string()),
    outreach_script_variants: z.array(z.object({
      channel: z.string(),
      script: z.string(),
    })),
    intro_post_template: z.object({
      headline: z.string(),
      body: z.string(),
      call_to_action: z.string(),
    }),
    daily_actions_7_days: z.array(z.object({
      day: z.number(),
      actions: z.array(z.string()),
    })),
  }),
  pricing: z.object({
    suggested_price_range: z.string(),
    free_vs_paid_strategy: z.string(),
    when_to_add_course: z.string(),
    simple_value_math: z.string(),
  }),
  copy_bank: z.object({
    hook_lines: z.array(z.string()),
    pain_point_phrases: z.array(z.string()),
    objection_handlers: z.array(z.string()),
    about_page_template: z.object({
      headline: z.string(),
      subheadline: z.string(),
      bullets: z.array(z.string()),
      how_it_works: z.array(z.string()),
      who_this_is_for: z.array(z.string()),
      call_to_action: z.string(),
    }),
  }),
  launch_plan_7_days: z.array(z.object({
    day: z.number(),
    goal: z.string(),
    tasks: z.array(z.string()),
  })),
  onboarding: z.object({
    welcome_post: z.object({
      headline: z.string(),
      body: z.string(),
      first_action: z.string(),
    }),
    rules: z.array(z.string()),
    weekly_schedule_post: z.object({
      headline: z.string(),
      schedule: z.array(z.string()),
    }),
    first_challenge_post: z.object({
      headline: z.string(),
      challenge: z.string(),
      how_to_participate: z.array(z.string()),
    }),
    checklist: z.array(z.string()),
  }),
  disclaimers: z.object({
    educational_notice: z.string(),
  }),
});

export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;
