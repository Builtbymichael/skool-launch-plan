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
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@skoolprep.com";

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
      emailEnabled: !!RESEND_API_KEY,
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

  // Send plan via email
  app.post("/api/send-plan-email", async (req: Request, res: Response) => {
    if (!RESEND_API_KEY) {
      return res.status(503).json({
        error: "Email not configured",
        message: "Email delivery is not available. Download or save your plan instead.",
      });
    }

    const { email, plan } = req.body;
    if (!email || !plan) {
      return res.status(400).json({ error: "Email and plan are required" });
    }

    try {
      const emailHtml = generatePlanEmailHtml(plan, SKOOL_AFFILIATE_URL);
      
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: `Your Skool Launch Plan: ${plan.meta?.topic || "Your Plan"}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send email");
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({
        error: "Failed to send email",
        message: error.message || "Could not send email. Please try again.",
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
      const [todayGenerations, totalSearches, topTopics] = await Promise.all([
        storage.getDailyGlobalCount(dateKey),
        storage.getTotalSearchCount(),
        storage.getTopTopics(20),
      ]);

      res.json({
        todayGenerations,
        totalSearches,
        topTopics,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  return httpServer;
}

function generatePlanEmailHtml(plan: any, affiliateUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Skool Launch Plan</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 32px; }
    h3 { color: #4b5563; }
    .card { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .cta { background: #2563eb; color: white; padding: 16px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 24px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    .day-card { background: #f3f4f6; border-left: 4px solid #2563eb; padding: 12px; margin: 12px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Your Skool Launch Plan</h1>
  <p><strong>Topic:</strong> ${plan.meta?.topic || "Your Community"}</p>
  <p><strong>Recommended:</strong> ${plan.meta?.recommended_path?.replace(/_/g, " + ") || "Community"}</p>

  <div class="card">
    <h3>Your One-Liner</h3>
    <p><strong>${plan.positioning?.one_liner || ""}</strong></p>
  </div>

  <h2>Community Name Ideas</h2>
  <ul>
    ${(plan.positioning?.community_name_options || []).map((name: string) => `<li>${name}</li>`).join("")}
  </ul>

  <h2>Transformation Promise</h2>
  <p>${plan.positioning?.transformation_promise || ""}</p>

  <h2>7-Day Launch Plan</h2>
  ${(plan.launch_plan_7_days || []).map((day: any) => `
    <div class="day-card">
      <strong>Day ${day.day}: ${day.goal}</strong>
      <ul>
        ${(day.tasks || []).map((task: string) => `<li>${task}</li>`).join("")}
      </ul>
    </div>
  `).join("")}

  <h2>Finding Your First 20 Members</h2>
  <p><strong>Where to find them:</strong></p>
  <ul>
    ${(plan.first_20_members?.where_to_find_them || []).map((place: string) => `<li>${place}</li>`).join("")}
  </ul>

  <h2>Pricing Strategy</h2>
  <div class="card">
    <p><strong>Suggested Range:</strong> ${plan.pricing?.suggested_price_range || ""}</p>
    <p>${plan.pricing?.free_vs_paid_strategy || ""}</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="${affiliateUrl}" class="cta">Start Your Free Skool Trial</a>
  </div>

  <h2>Hook Lines You Can Use</h2>
  <ul>
    ${(plan.copy_bank?.hook_lines || []).slice(0, 6).map((hook: string) => `<li>${hook}</li>`).join("")}
  </ul>

  <div class="footer">
    <p>${plan.disclaimers?.educational_notice || "This plan is for educational purposes only."}</p>
    <p>Created with <a href="https://skoolprep.com">Skool Prep</a></p>
  </div>
</body>
</html>
  `;
}
