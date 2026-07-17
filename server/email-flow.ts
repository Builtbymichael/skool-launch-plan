import { Resend } from "resend";
import { storage } from "./storage";
import type { EmailSubscriber } from "@shared/schema";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SUBSCRIBER_FROM = process.env.SUBSCRIBER_FROM_EMAIL || "Skool Prep <updates@skoolprep.com>";
const APP_URL = process.env.APP_URL || "https://launchplan.skoolprep.com";
const AFFILIATE_URL = process.env.SKOOL_AFFILIATE_URL || "https://www.skool.com";

function footerHtml(token: string): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 12px"/>
<p style="font-size:12px;color:#9ca3af">You're receiving this because you created a launch plan at <a href="${APP_URL}" style="color:#9ca3af">launchplan.skoolprep.com</a>. <a href="${APP_URL}/api/unsubscribe?token=${token}" style="color:#9ca3af">Unsubscribe</a><br/>Some links are affiliate links — if you sign up to Skool through them, SkoolPrep earns a commission at no cost to you.</p>`;
}

function footerText(token: string): string {
  return `\n\n--\nYou're receiving this because you created a launch plan at launchplan.skoolprep.com. Unsubscribe: ${APP_URL}/api/unsubscribe?token=${token}\nSome links are affiliate links — if you sign up to Skool through them, SkoolPrep earns a commission at no cost to you.`;
}

function ctaButton(label: string, url: string): string {
  return `<p style="margin:22px 0"><a href="${url}" style="background:#EF3E36;color:#ffffff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:bold">${label}</a></p>`;
}

function wrap(paragraphsHtml: string, token: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;line-height:1.6">${paragraphsHtml}${footerHtml(token)}</div>`;
}

async function send(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!resend) {
    console.warn("Resend not configured — cannot send subscriber email");
    return false;
  }
  try {
    await resend.emails.send({ from: SUBSCRIBER_FROM, to, replyTo: "michael@builtbymichael.com", subject, html, text });
    return true;
  } catch (err) {
    console.error(`Failed to send \"${subject}\" to ${to}:`, err);
    return false;
  }
}

// ---------- Email 0: their plan (instant, on subscribe) ----------
export async function sendPlanEmail(sub: EmailSubscriber, planJson: string): Promise<boolean> {
  let plan: any = null;
  try { plan = JSON.parse(planJson); } catch { /* summary degrades gracefully */ }
  const planUrl = `${APP_URL}/plan/${sub.planId}`;
  const topic = plan?.meta?.topic || sub.topic || "your community";
  const pathLabel = plan?.meta?.recommended_path === "community_plus_course" ? "Community + Course combo" : plan?.meta?.recommended_path === "course" ? "Course" : "Community";

  const summaryHtml = plan ? `
<div style="background:#f9fafb;border-radius:10px;padding:18px 20px;margin:18px 0">
  <h2 style="color:#0B3D91;margin:0 0 4px;font-size:18px">${topic}</h2>
  <p style="margin:0 0 12px;color:#6b7280;font-size:13px">Recommended path: <strong>${pathLabel}</strong></p>
  <p style="margin:8px 0"><strong>Positioning:</strong> ${plan.positioning?.one_liner || ""}</p>
  <p style="margin:8px 0"><strong>The promise:</strong> ${plan.positioning?.transformation_promise || ""}</p>
  <p style="margin:8px 0"><strong>Pricing:</strong> ${plan.pricing?.suggested_price_range || ""}</p>
  <p style="margin:8px 0"><strong>Day 1:</strong> ${plan.launch_plan_7_days?.[0]?.goal || ""}</p>
</div>` : "";

  const html = wrap(`
<p>Hi,</p>
<p>Here's the launch plan you just built — saved so you don't lose it:</p>
${summaryHtml}
${ctaButton("View your full plan →", planUrl)}
<p>The single biggest predictor of whether a community works isn't the niche or the name — it's whether you actually launch. Your plan gives you the steps. Skool gives you the platform: community, courses, payments and a leaderboard in one place, with a 14-day free trial (no card needed).</p>
${ctaButton("Start your free Skool trial →", AFFILIATE_URL)}
<p>Over the next week I'll send you three short emails covering the mistakes that kill new communities, what to charge your members, and what successful communities in your position actually did. Keep an eye out.</p>
<p>Michael<br/>SkoolPrep.com</p>`, sub.unsubscribeToken);

  const text = `Hi,\n\nHere's the launch plan you just built — saved so you don't lose it.\n\nView your full plan: ${planUrl}\n\nThe single biggest predictor of whether a community works isn't the niche or the name — it's whether you actually launch. Your plan gives you the steps. Skool gives you the platform, with a 14-day free trial (no card needed): ${AFFILIATE_URL}\n\nOver the next week I'll send you three short emails covering the mistakes that kill new communities, what to charge your members, and what successful communities actually did.\n\nMichael\nSkoolPrep.com${footerText(sub.unsubscribeToken)}`;

  return send(sub.email, "Your Skool launch plan is here", html, text);
}

// ---------- Drip emails 1–3 ----------
function email1(sub: EmailSubscriber) {
  const html = wrap(`
<p>Hi,</p>
<p>You've got your launch plan. Before you build anything, here are the three mistakes that sink most new communities — all avoidable:</p>
<p><strong>1. Launching to nobody.</strong> A community with zero members on day one feels dead to the first visitor. Fix: recruit 5–10 founding members from people you already know <em>before</em> you announce anything. Your plan's first-members step matters more than your logo ever will.</p>
<p><strong>2. Overbuilding before launch.</strong> Weeks spent on course modules and perfect descriptions while zero humans are inside. Fix: launch with one space, one pinned welcome post, and one piece of genuinely useful content. Add the rest when real members ask for it.</p>
<p><strong>3. Charging too late.</strong> \"I'll make it free until it grows\" trains members that it's worth $0. Fix: even a small founding-member price filters for people who'll actually participate. Free members lurk; paying members show up.</p>
<p>Skool is built around avoiding all three — the leaderboard and levels give early members a reason to post from day one.</p>
${ctaButton("Set up your community free for 14 days →", AFFILIATE_URL)}
<p>Next up: what to actually charge your members (with the math).</p>
<p>Michael<br/>SkoolPrep.com</p>`, sub.unsubscribeToken);
  const text = `Hi,\n\nThree mistakes that sink most new communities:\n\n1. Launching to nobody — recruit 5–10 founding members before you announce anything.\n2. Overbuilding before launch — start with one space, one welcome post, one useful piece of content.\n3. Charging too late — even a small founding price filters for people who show up.\n\nSkool is built around avoiding all three: ${AFFILIATE_URL}\n\nNext up: what to actually charge your members.\n\nMichael\nSkoolPrep.com${footerText(sub.unsubscribeToken)}`;
  return { subject: "The 3 mistakes that kill new Skool communities", html, text };
}

function email2(sub: EmailSubscriber) {
  const html = wrap(`
<p>Hi,</p>
<p>The question every new community owner gets stuck on: what do I charge? Here are the three models that work most often on Skool, with the math:</p>
<p><strong>1. Simple monthly membership.</strong> The workhorse. Price at $19–49/month for a niche skill community. The math is friendly at small scale: 50 members × $29 = <strong>$1,450/month</strong> — and 50 members is a genuinely reachable first milestone. You don't need an audience of thousands.</p>
<p><strong>2. Founding-member launch.</strong> Open with 10–20 founding places at a locked-in lower rate (say $15/month, forever). It gets your first paying members in fast, seeds the activity that makes the community feel alive, and creates honest urgency. 20 founders × $15 = <strong>$300/month</strong> before you've even properly launched.</p>
<p><strong>3. Free community + paid upgrade.</strong> Run a free community as your top-of-funnel, with a paid tier for the serious: a course, weekly live calls, or closer access to you. Even a 5% upgrade rate works: 400 free members, 20 paying $49 = <strong>$980/month</strong> — and the free tier keeps feeding it.</p>
<p>Whichever model fits your plan, the members-pay-you machinery (checkout, subscriptions, free trials, founding prices) is built into Skool — no Stripe wrangling, no plugins:</p>
${ctaButton("Set up your community free for 14 days →", AFFILIATE_URL)}
<p>One more email coming: what the communities that actually make it have in common.</p>
<p>Michael<br/>SkoolPrep.com</p>`, sub.unsubscribeToken);
  const text = `Hi,\n\nWhat should you charge? Three models that work on Skool:\n\n1. Monthly membership: 50 members × $29 = $1,450/month — a reachable first milestone.\n2. Founding-member launch: 20 founders × $15 = $300/month before you've properly launched, plus honest urgency.\n3. Free community + paid upgrade: 400 free members, 20 paying $49 = $980/month at just a 5% upgrade rate.\n\nThe checkout/subscription machinery is built into Skool: ${AFFILIATE_URL}\n\nOne more email coming: what the communities that make it have in common.\n\nMichael\nSkoolPrep.com${footerText(sub.unsubscribeToken)}`;
  return { subject: "What should you charge for your community?", html, text };
}

function email3(sub: EmailSubscriber) {
  const html = wrap(`
<p>Hi,</p>
<p>Last one from me. A week ago you built a launch plan. Here's why it's worth acting on it now rather than someday:</p>
<p>Skool has verified communities in <em>wildly</em> different niches each earning over $1M/year — dog training, pottery, chess, calisthenics, day trading. Not tech gurus: ordinary experts who packaged what they know. I wrote up 11 of them here: <a href="https://skoolprep.com/skool-millionaire-communities">skoolprep.com/skool-millionaire-communities</a></p>
<p>What they share isn't audience size or niche. It's three things: they launched before they felt ready, they charged from early on, and they showed up consistently for a small group before it became a big one.</p>
<p>You already have the plan for all three. The only missing step is the platform:</p>
${ctaButton("Start your Skool community — free for 14 days →", AFFILIATE_URL)}
<p>If you launch, I'd genuinely love to hear how it goes — just reply to this email.</p>
<p>Michael<br/>SkoolPrep.com</p>`, sub.unsubscribeToken);
  const text = `Hi,\n\nLast one from me. Skool has verified communities in wildly different niches each earning over $1M/year — dog training, pottery, chess, day trading. I wrote up 11 of them: https://skoolprep.com/skool-millionaire-communities\n\nWhat they share: they launched before they felt ready, charged early, and showed up consistently for a small group first.\n\nYou already have the plan. The missing step is the platform: ${AFFILIATE_URL}\n\nIf you launch, reply and tell me how it goes.\n\nMichael\nSkoolPrep.com${footerText(sub.unsubscribeToken)}`;
  return { subject: "What successful Skool communities have in common", html, text };
}

// stage N means N emails sent. Drip: stage 1 → email1 at 2 days, stage 2 → email2 at 4 days, stage 3 → email3 at 7 days.
const DRIP = [
  { fromStage: 1, afterDays: 2, build: email1 },
  { fromStage: 2, afterDays: 4, build: email2 },
  { fromStage: 3, afterDays: 7, build: email3 },
];

export async function runDrip(): Promise<void> {
  try {
    const subs = await storage.getActiveDripSubscribers();
    const now = Date.now();
    for (const sub of subs) {
      const step = DRIP.find((d) => d.fromStage === sub.stage);
      if (!step) continue;
      const ageDays = (now - new Date(sub.createdAt).getTime()) / 86400000;
      if (ageDays < step.afterDays) continue;
      const { subject, html, text } = step.build(sub);
      const ok = await send(sub.email, subject, html, text);
      if (ok) {
        await storage.advanceSubscriberStage(sub.id, sub.stage + 1);
        console.log(`Drip email (stage ${sub.stage} → ${sub.stage + 1}) sent to ${sub.email}`);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  } catch (err) {
    console.error("Drip run failed:", err);
  }
}

let dripStarted = false;
export function startDripScheduler(): void {
  if (dripStarted) return;
  dripStarted = true;
  setTimeout(runDrip, 60 * 1000);
  setInterval(runDrip, 6 * 60 * 60 * 1000);
  console.log("Drip scheduler started (runs every 6 hours)");
}
