import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { planFormSchema } from "@shared/schema";
import { createHash } from "crypto";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const HASH_SALT = process.env.HASH_SALT || "default-salt";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SKOOL_AFFILIATE_URL = process.env.SKOOL_AFFILIATE_URL || "https://www.skool.com";

const USER_DAILY_LIMIT = 3;
const GLOBAL_DAILY_LIMIT = 100;

function getUserHash(req: Request): string {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  return createHash("sha256").update(`${ip}:${ua}:${HASH_SALT}`).digest("hex");
}

function getDateKey(): string {
  return new Date().toISOString().split("T")[0];
}

const SYSTEM_PROMPT = `You are an expert Skool community and course strategist.

Your job is to turn a user's topic into a practical, Skool-native launch blueprint that helps them get their first 20 members.

Hard rules:
- Output MUST be valid JSON only.
- No markdown, no commentary, no emojis.
- Be encouraging but not hypey.
- No income guarantees.
- Avoid medical, legal, or financial advice.
- Do not include URLs.
- The plan must be actionable for a solo creator starting from zero.
- Frame everything as a solid starting blueprint, not a verdict.

Return recommended_path as exactly one of:
"community" | "course" | "community_plus_course"`;

function buildUserPrompt(topic: string, outcome: string, audience: string, background: string): string {
  return `Create a Skool launch plan using these inputs:

topic: "${topic}"
outcome_30_90: "${outcome}"
audience_level: "${audience || "not specified"}"
background: "${background || "not specified"}"

Return STRICT JSON using this schema:

{
  "meta": {
    "topic": "...",
    "outcome_30_90": "...",
    "audience_level": "...",
    "background": "...",
    "recommended_path": "community|course|community_plus_course"
  },
  "positioning": {
    "community_name_options": ["...", "...", "...", "...", "...", "...", "...", "..."],
    "one_liner": "...",
    "who_its_for": ["...", "...", "..."],
    "who_its_not_for": ["...", "...", "..."],
    "transformation_promise": "..."
  },
  "offer": {
    "format_explainer": "...",
    "weekly_structure": {
      "cadence": "...",
      "weekly_events": ["...", "..."],
      "weekly_posts": ["...", "...", "..."],
      "accountability_loop": "..."
    },
    "example_modules_or_themes": ["...", "...", "...", "...", "...", "..."],
    "content_types": ["...", "...", "...", "..."],
    "engagement_loops": ["...", "...", "...", "..."]
  },
  "first_20_members": {
    "where_to_find_them": ["...", "...", "...", "...", "...", "..."],
    "outreach_script_variants": [
      { "channel": "DM|email|comment|in-person", "script": "..." },
      { "channel": "DM|email|comment|in-person", "script": "..." },
      { "channel": "DM|email|comment|in-person", "script": "..." }
    ],
    "intro_post_template": {
      "headline": "...",
      "body": "...",
      "call_to_action": "..."
    },
    "daily_actions_7_days": [
      {"day":1,"actions":["...","...","..."]},
      {"day":2,"actions":["...","...","..."]},
      {"day":3,"actions":["...","...","..."]},
      {"day":4,"actions":["...","...","..."]},
      {"day":5,"actions":["...","...","..."]},
      {"day":6,"actions":["...","...","..."]},
      {"day":7,"actions":["...","...","..."]}
    ]
  },
  "pricing": {
    "suggested_price_range": "...",
    "free_vs_paid_strategy": "...",
    "when_to_add_course": "...",
    "simple_value_math": "..."
  },
  "copy_bank": {
    "hook_lines": ["...","...","...","...","...","...","...","...","...","...","...","..."],
    "pain_point_phrases": ["...","...","...","...","...","...","...","...","...","...","...","..."],
    "objection_handlers": ["...","...","...","...","...","...","...","..."],
    "about_page_template": {
      "headline": "...",
      "subheadline": "...",
      "bullets": ["...","...","...","...","..."],
      "how_it_works": ["...","...","..."],
      "who_this_is_for": ["...","...","..."],
      "call_to_action": "..."
    }
  },
  "launch_plan_7_days": [
    {"day":1,"goal":"...","tasks":["...","...","..."]},
    {"day":2,"goal":"...","tasks":["...","...","..."]},
    {"day":3,"goal":"...","tasks":["...","...","..."]},
    {"day":4,"goal":"...","tasks":["...","...","..."]},
    {"day":5,"goal":"...","tasks":["...","...","..."]},
    {"day":6,"goal":"...","tasks":["...","...","..."]},
    {"day":7,"goal":"...","tasks":["...","...","..."]}
  ],
  "onboarding": {
    "welcome_post": {
      "headline": "...",
      "body": "...",
      "first_action": "..."
    },
    "rules": ["...","...","...","...","..."],
    "weekly_schedule_post": {
      "headline": "...",
      "schedule": ["...","...","...","..."]
    },
    "first_challenge_post": {
      "headline": "...",
      "challenge": "...",
      "how_to_participate": ["...","...","..."]
    },
    "checklist": ["...","...","...","...","...","...","...","..."]
  },
  "disclaimers": {
    "educational_notice": "..."
  }
}

Decision logic:
- If ongoing accountability and wins matter → community
- If step-by-step transformation → course
- If both → community_plus_course

Return JSON only.`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Check required env vars
  app.get("/api/config", (req: Request, res: Response) => {
    const missing: string[] = [];
    if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) missing.push("OpenAI API Key");
    if (!process.env.HASH_SALT) missing.push("HASH_SALT");
    if (!process.env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
    if (!process.env.SKOOL_AFFILIATE_URL) missing.push("SKOOL_AFFILIATE_URL");

    res.json({
      configured: missing.length === 0,
      missing,
      affiliateUrl: SKOOL_AFFILIATE_URL,
    });
  });

  // Generate plan
  app.post("/api/generate-plan", async (req: Request, res: Response) => {
    try {
      // Validate input
      const validation = planFormSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: validation.error.errors 
        });
      }

      const { topic, outcome, audienceLevel, background } = validation.data;
      const userHash = getUserHash(req);
      const dateKey = getDateKey();

      // Check rate limits
      const userCount = await storage.getUserGenerationCount(userHash, dateKey);
      if (userCount >= USER_DAILY_LIMIT) {
        return res.status(429).json({
          error: "Daily limit reached",
          message: `You've used all ${USER_DAILY_LIMIT} plan generations for today. Come back tomorrow, or check out the Skool Prep blog for more tips!`,
          resetTime: "midnight UTC",
        });
      }

      const globalCount = await storage.getDailyGlobalCount(dateKey);
      if (globalCount >= GLOBAL_DAILY_LIMIT) {
        return res.status(429).json({
          error: "Global limit reached",
          message: "The tool is very popular today! We've hit our daily generation limit. Please try again tomorrow, or check out the Skool Prep blog for helpful content.",
          resetTime: "midnight UTC",
        });
      }

      // Generate plan with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(topic, outcome, audienceLevel || "", background || "") },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      let plan;
      try {
        plan = JSON.parse(content);
      } catch {
        console.error("Failed to parse AI response:", content);
        throw new Error("Failed to parse AI response");
      }

      // Increment counters after successful generation
      await Promise.all([
        storage.incrementUserGenerationCount(userHash, dateKey),
        storage.incrementDailyGlobalCount(dateKey),
        storage.recordTopicSearch({
          topic,
          audienceLevel: audienceLevel || null,
          background: background || null,
        }),
      ]);

      res.json(plan);
    } catch (error: any) {
      console.error("Error generating plan:", error);
      res.status(500).json({
        error: "Failed to generate plan",
        message: error.message || "Something went wrong. Please try again.",
      });
    }
  });

  // Admin endpoints
  app.post("/api/admin/verify", (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ valid: true });
    } else {
      res.status(401).json({ valid: false });
    }
  });

  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    const password = req.headers["x-admin-password"];
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const dateKey = getDateKey();
      const [todayGenerations, totalSearches, topTopics, emailSubscribers] = await Promise.all([
        storage.getDailyGlobalCount(dateKey),
        storage.getTotalSearchCount(),
        storage.getTopTopics(20),
        storage.getEmailSubscriberCount(),
      ]);

      res.json({
        todayGenerations,
        totalSearches,
        topTopics,
        emailSubscribers,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  return httpServer;
}

