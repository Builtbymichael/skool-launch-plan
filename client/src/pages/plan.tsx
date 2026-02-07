import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, Copy, Check, ArrowLeft, ExternalLink, 
  Users, Target, DollarSign, Calendar, MessageSquare, 
  Rocket, BookOpen, CheckCircle2, Loader2, Download 
} from "lucide-react";
import { type GeneratedPlan } from "@shared/schema";
import logoImg from "@assets/Skool_Prep_Logo_(1)_1770489917211.png";

interface AppConfig {
  affiliateUrl: string;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ description: `${label || "Content"} copied to clipboard` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-8 w-8"
      data-testid={`button-copy-${label?.toLowerCase().replace(/\s+/g, '-') || 'text'}`}
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function CopyableSection({ title, content, multiline = false }: { title: string; content: string; multiline?: boolean }) {
  return (
    <div className="group relative bg-muted/50 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
          <p className={`text-sm ${multiline ? 'whitespace-pre-wrap' : ''}`}>{content}</p>
        </div>
        <CopyButton text={content} label={title} />
      </div>
    </div>
  );
}

function generatePlanHtml(plan: GeneratedPlan, affiliateUrl: string): string {
  const pathLabel = plan.meta.recommended_path === "community_plus_course" 
    ? "Community + Course Combo" 
    : plan.meta.recommended_path === "course" 
    ? "Course" 
    : "Community";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Your Skool Launch Plan - ${plan.meta.topic}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { color: #0B3D91; margin-bottom: 4px; }
  h2 { color: #0B3D91; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 32px; }
  h3 { color: #374151; margin-top: 20px; }
  .subtitle { color: #6b7280; margin-top: 0; }
  .badge { display: inline-block; background: #0B3D91; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; margin-bottom: 16px; }
  .card { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 12px 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .grid-item { background: #f3f4f6; border-radius: 6px; padding: 10px 14px; font-size: 14px; }
  ul { padding-left: 20px; }
  li { margin: 6px 0; }
  .day-card { background: #f3f4f6; border-left: 4px solid #0B3D91; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
  .day-num { display: inline-block; background: #0B3D91; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px; margin-right: 8px; }
  .section-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .cta-box { background: #0B3D91; border-radius: 10px; padding: 28px 24px; text-align: center; margin: 36px 0; }
  .cta-box h3 { color: white; margin: 0 0 8px 0; font-size: 20px; }
  .cta-box p { color: #c5d4eb; margin: 0 0 16px 0; font-size: 15px; }
  .cta-btn { display: inline-block; background: #EF3E36; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; text-align: center; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style></head><body>
<h1>Your Skool Launch Plan</h1>
<p class="subtitle">${plan.meta.topic}</p>
<span class="badge">Recommended: ${pathLabel}</span>

<h2>Positioning</h2>
<h3>Community Name Ideas</h3>
<div class="grid">${plan.positioning.community_name_options.map(n => `<div class="grid-item">${n}</div>`).join('')}</div>
<div class="card"><p class="section-label">One-liner</p><p><strong>${plan.positioning.one_liner}</strong></p></div>
<div class="card"><p class="section-label">Transformation Promise</p><p>${plan.positioning.transformation_promise}</p></div>
<div class="grid" style="margin-top:12px">
<div><h3>Who it's for</h3><ul>${plan.positioning.who_its_for.map(w => `<li>${w}</li>`).join('')}</ul></div>
<div><h3>Who it's not for</h3><ul>${plan.positioning.who_its_not_for.map(w => `<li>${w}</li>`).join('')}</ul></div>
</div>

<h2>Your Offer Structure</h2>
<div class="card"><p class="section-label">Format Explainer</p><p>${plan.offer.format_explainer}</p></div>
<h3>Weekly Structure</h3>
<div class="card"><p class="section-label">Cadence</p><p>${plan.offer.weekly_structure.cadence}</p></div>
<div class="grid">
<div><h3>Weekly Events</h3><ul>${plan.offer.weekly_structure.weekly_events.map(e => `<li>${e}</li>`).join('')}</ul></div>
<div><h3>Weekly Posts</h3><ul>${plan.offer.weekly_structure.weekly_posts.map(p => `<li>${p}</li>`).join('')}</ul></div>
</div>
<div class="card"><p class="section-label">Accountability Loop</p><p>${plan.offer.weekly_structure.accountability_loop}</p></div>
<h3>Example Modules or Themes</h3>
<div class="grid">${plan.offer.example_modules_or_themes.map(m => `<div class="grid-item">${m}</div>`).join('')}</div>
<h3>Content Types</h3>
<ul>${plan.offer.content_types.map(c => `<li>${c}</li>`).join('')}</ul>
<h3>Engagement Loops</h3>
<ul>${plan.offer.engagement_loops.map(e => `<li>${e}</li>`).join('')}</ul>

<h2>Finding Your First 20 Members</h2>
<h3>Where to Find Them</h3>
<div class="grid">${plan.first_20_members.where_to_find_them.map(p => `<div class="grid-item">${p}</div>`).join('')}</div>
<h3>Outreach Scripts</h3>
${plan.first_20_members.outreach_script_variants.map(s => `<div class="card"><p class="section-label">${s.channel}</p><p>${s.script}</p></div>`).join('')}
<h3>Intro Post Template</h3>
<div class="card">
<p class="section-label">Headline</p><p><strong>${plan.first_20_members.intro_post_template.headline}</strong></p>
<p class="section-label">Body</p><p>${plan.first_20_members.intro_post_template.body}</p>
<p class="section-label">Call to Action</p><p>${plan.first_20_members.intro_post_template.call_to_action}</p>
</div>

<h2>Pricing Strategy</h2>
<div class="card"><p class="section-label">Suggested Price Range</p><p><strong>${plan.pricing.suggested_price_range}</strong></p></div>
<div class="card"><p class="section-label">Free vs Paid Strategy</p><p>${plan.pricing.free_vs_paid_strategy}</p></div>
<div class="card"><p class="section-label">When to Add a Course</p><p>${plan.pricing.when_to_add_course}</p></div>
<div class="card"><p class="section-label">Simple Value Math</p><p>${plan.pricing.simple_value_math}</p></div>

<h2>Copy Bank</h2>
<h3>Hook Lines</h3>
<div class="grid">${plan.copy_bank.hook_lines.map(h => `<div class="grid-item">${h}</div>`).join('')}</div>
<h3>Pain Point Phrases</h3>
<div class="grid">${plan.copy_bank.pain_point_phrases.map(p => `<div class="grid-item">${p}</div>`).join('')}</div>
<h3>Objection Handlers</h3>
${plan.copy_bank.objection_handlers.map((o, i) => `<div class="card"><p class="section-label">Objection ${i+1}</p><p>${o}</p></div>`).join('')}
<h3>About Page Template</h3>
<div class="card">
<p><strong>${plan.copy_bank.about_page_template.headline}</strong></p>
<p>${plan.copy_bank.about_page_template.subheadline}</p>
<ul>${plan.copy_bank.about_page_template.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
<p class="section-label">How It Works</p>
<ul>${plan.copy_bank.about_page_template.how_it_works.map(h => `<li>${h}</li>`).join('')}</ul>
<p class="section-label">Call to Action</p>
<p><strong>${plan.copy_bank.about_page_template.call_to_action}</strong></p>
</div>

<h2>7-Day Launch Plan</h2>
${plan.launch_plan_7_days.map(d => `<div class="day-card"><p><span class="day-num">${d.day}</span><strong>${d.goal}</strong></p><ul>${d.tasks.map(t => `<li>${t}</li>`).join('')}</ul></div>`).join('')}

<h2>Member Onboarding</h2>
<h3>Welcome Post</h3>
<div class="card">
<p class="section-label">Headline</p><p><strong>${plan.onboarding.welcome_post.headline}</strong></p>
<p class="section-label">Body</p><p>${plan.onboarding.welcome_post.body}</p>
<p class="section-label">First Action</p><p>${plan.onboarding.welcome_post.first_action}</p>
</div>
<h3>Community Rules</h3>
<ol>${plan.onboarding.rules.map(r => `<li>${r}</li>`).join('')}</ol>
<h3>Weekly Schedule Post</h3>
<div class="card">
<p><strong>${plan.onboarding.weekly_schedule_post.headline}</strong></p>
<ul>${plan.onboarding.weekly_schedule_post.schedule.map(s => `<li>${s}</li>`).join('')}</ul>
</div>
<h3>First Challenge Post</h3>
<div class="card">
<p><strong>${plan.onboarding.first_challenge_post.headline}</strong></p>
<p>${plan.onboarding.first_challenge_post.challenge}</p>
<p class="section-label">How to Participate</p>
<ol>${plan.onboarding.first_challenge_post.how_to_participate.map(h => `<li>${h}</li>`).join('')}</ol>
</div>
<h3>Onboarding Checklist</h3>
<ul>${plan.onboarding.checklist.map(c => `<li>${c}</li>`).join('')}</ul>

<h2>Daily Actions (First 7 Days)</h2>
${plan.first_20_members.daily_actions_7_days.map(d => `<div class="day-card"><p><span class="day-num">${d.day}</span><strong>Day ${d.day}</strong></p><ul>${d.actions.map(a => `<li>${a}</li>`).join('')}</ul></div>`).join('')}

<div class="cta-box">
<h3>Ready to launch your Skool community?</h3>
<p>You've got the plan. Now bring it to life with a free Skool trial.</p>
<a href="${affiliateUrl}" class="cta-btn">Start Your Free Skool Trial</a>
</div>

<div class="footer">
<p>${plan.disclaimers.educational_notice}</p>
<p>Created with <a href="https://skoolprep.com">Skool Prep</a></p>
</div>
</body></html>`;
}

function downloadPlanAsHtml(plan: GeneratedPlan, affiliateUrl: string) {
  const html = generatePlanHtml(plan, affiliateUrl);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `skool-launch-plan-${plan.meta.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Plan() {
  const [, navigate] = useLocation();
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const { toast } = useToast();

  const { data: config } = useQuery<AppConfig>({
    queryKey: ["/api/config"],
  });

  useEffect(() => {
    const storedPlan = sessionStorage.getItem("generatedPlan");
    if (storedPlan) {
      try {
        setPlan(JSON.parse(storedPlan));
      } catch {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pathLabel = {
    community: "Skool Community",
    course: "Skool Course",
    community_plus_course: "Community + Course Combo",
  }[plan.meta.recommended_path];

  const affiliateUrl = config?.affiliateUrl || "https://www.skool.com";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center" data-testid="link-home-logo">
              <img src={logoImg} alt="Skool Prep" className="w-8 h-8 rounded-md" />
            </a>
            <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Create another plan
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                downloadPlanAsHtml(plan, affiliateUrl);
                toast({ description: "Plan downloaded! Open the file in your browser and print to save as PDF." });
              }}
              data-testid="button-download-plan"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <a
              href="https://skoolprep.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline"
              data-testid="link-skoolprep"
            >
              by skoolprep.com
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoImg} alt="Skool Prep" className="w-10 h-10 rounded-md" />
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-plan-title">Your Skool Launch Plan</h1>
              <p className="text-muted-foreground">{plan.meta.topic}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm" data-testid="badge-recommended-path">
            Recommended: {pathLabel}
          </Badge>
        </div>

        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Ready to start your Skool?</h3>
                <p className="text-muted-foreground">
                  Skool lets you launch your community for free. Start while this plan is fresh!
                </p>
              </div>
              <Button size="lg" asChild data-testid="button-start-skool">
                <a href={affiliateUrl} target="_blank" rel="noopener noreferrer">
                  Launch This on Skool — Free Trial
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="positioning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto gap-1 p-1">
            <TabsTrigger value="positioning" className="text-xs px-2" data-testid="tab-positioning">
              <Target className="h-3 w-3 mr-1 hidden sm:inline" />Positioning
            </TabsTrigger>
            <TabsTrigger value="offer" className="text-xs px-2" data-testid="tab-offer">
              <BookOpen className="h-3 w-3 mr-1 hidden sm:inline" />Offer
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs px-2" data-testid="tab-members">
              <Users className="h-3 w-3 mr-1 hidden sm:inline" />First 20
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs px-2" data-testid="tab-pricing">
              <DollarSign className="h-3 w-3 mr-1 hidden sm:inline" />Pricing
            </TabsTrigger>
            <TabsTrigger value="copy" className="text-xs px-2" data-testid="tab-copy">
              <MessageSquare className="h-3 w-3 mr-1 hidden sm:inline" />Copy Bank
            </TabsTrigger>
            <TabsTrigger value="launch" className="text-xs px-2" data-testid="tab-launch">
              <Rocket className="h-3 w-3 mr-1 hidden sm:inline" />7-Day Launch
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="text-xs px-2" data-testid="tab-onboarding">
              <CheckCircle2 className="h-3 w-3 mr-1 hidden sm:inline" />Onboarding
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs px-2" data-testid="tab-actions">
              <Calendar className="h-3 w-3 mr-1 hidden sm:inline" />Daily Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positioning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Positioning
                </CardTitle>
                <CardDescription>How to position your Skool for maximum clarity and appeal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Community Name Ideas</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {plan.positioning.community_name_options.map((name, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                        <span className="text-sm">{name}</span>
                        <CopyButton text={name} label={`Name ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <CopyableSection title="One-liner" content={plan.positioning.one_liner} />
                <CopyableSection title="Transformation Promise" content={plan.positioning.transformation_promise} multiline />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Who it's for</h4>
                    <ul className="space-y-2">
                      {plan.positioning.who_its_for.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Who it's not for</h4>
                    <ul className="space-y-2">
                      {plan.positioning.who_its_not_for.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-destructive">✕</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Your Offer Structure
                </CardTitle>
                <CardDescription>What you'll deliver and how you'll structure your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <CopyableSection title="Format Explainer" content={plan.offer.format_explainer} multiline />

                <div>
                  <h4 className="font-medium mb-3">Weekly Structure</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <CopyableSection title="Cadence" content={plan.offer.weekly_structure.cadence} />
                    <CopyableSection title="Accountability Loop" content={plan.offer.weekly_structure.accountability_loop} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Weekly Events</h4>
                    <ul className="space-y-2">
                      {plan.offer.weekly_structure.weekly_events.map((event, i) => (
                        <li key={i} className="text-sm bg-muted/50 rounded-lg px-4 py-2">{event}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Weekly Posts</h4>
                    <ul className="space-y-2">
                      {plan.offer.weekly_structure.weekly_posts.map((post, i) => (
                        <li key={i} className="text-sm bg-muted/50 rounded-lg px-4 py-2">{post}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Example Modules or Themes</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {plan.offer.example_modules_or_themes.map((module, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg px-4 py-3 text-sm">{module}</div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Content Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.offer.content_types.map((type, i) => (
                        <Badge key={i} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Engagement Loops</h4>
                    <ul className="space-y-2">
                      {plan.offer.engagement_loops.map((loop, i) => (
                        <li key={i} className="text-sm">{loop}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Finding Your First 20 Members
                </CardTitle>
                <CardDescription>Where to find people and how to reach out</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Where to Find Them</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {plan.first_20_members.where_to_find_them.map((place, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg px-4 py-3 text-sm">{place}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Outreach Scripts</h4>
                  <Accordion type="single" collapsible className="w-full">
                    {plan.first_20_members.outreach_script_variants.map((script, i) => (
                      <AccordionItem key={i} value={`script-${i}`}>
                        <AccordionTrigger className="text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">{script.channel}</Badge>
                            Script {i + 1}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <CopyableSection title={`${script.channel} Script`} content={script.script} multiline />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Intro Post Template</h4>
                  <div className="space-y-3">
                    <CopyableSection title="Headline" content={plan.first_20_members.intro_post_template.headline} />
                    <CopyableSection title="Body" content={plan.first_20_members.intro_post_template.body} multiline />
                    <CopyableSection title="Call to Action" content={plan.first_20_members.intro_post_template.call_to_action} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Pricing Strategy
                </CardTitle>
                <CardDescription>How to price and when to monetize</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CopyableSection title="Suggested Price Range" content={plan.pricing.suggested_price_range} />
                <CopyableSection title="Free vs Paid Strategy" content={plan.pricing.free_vs_paid_strategy} multiline />
                <CopyableSection title="When to Add a Course" content={plan.pricing.when_to_add_course} multiline />
                <CopyableSection title="Simple Value Math" content={plan.pricing.simple_value_math} multiline />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Copy Bank
                </CardTitle>
                <CardDescription>Ready-to-use marketing copy you can adapt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Hook Lines</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {plan.copy_bank.hook_lines.map((hook, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                        <span className="text-sm">{hook}</span>
                        <CopyButton text={hook} label={`Hook ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Pain Point Phrases</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {plan.copy_bank.pain_point_phrases.map((phrase, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                        <span className="text-sm">{phrase}</span>
                        <CopyButton text={phrase} label={`Pain point ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Objection Handlers</h4>
                  <div className="space-y-2">
                    {plan.copy_bank.objection_handlers.map((handler, i) => (
                      <CopyableSection key={i} title={`Objection ${i + 1}`} content={handler} />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">About Page Template</h4>
                  <div className="space-y-3">
                    <CopyableSection title="Headline" content={plan.copy_bank.about_page_template.headline} />
                    <CopyableSection title="Subheadline" content={plan.copy_bank.about_page_template.subheadline} />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Bullet Points</p>
                      <ul className="space-y-2">
                        {plan.copy_bank.about_page_template.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                            <span className="text-sm">{bullet}</span>
                            <CopyButton text={bullet} label={`Bullet ${i + 1}`} />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">How It Works</p>
                      <ol className="space-y-2">
                        {plan.copy_bank.about_page_template.how_it_works.map((step, i) => (
                          <li key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                            <span className="text-sm"><strong>Step {i + 1}:</strong> {step}</span>
                            <CopyButton text={step} label={`Step ${i + 1}`} />
                          </li>
                        ))}
                      </ol>
                    </div>
                    <CopyableSection title="Call to Action" content={plan.copy_bank.about_page_template.call_to_action} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="launch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  7-Day Launch Plan
                </CardTitle>
                <CardDescription>Your day-by-day roadmap to launch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plan.launch_plan_7_days.map((day) => (
                    <div key={day.day} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">{day.day}</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Day {day.day}</p>
                          <p className="font-medium">{day.goal}</p>
                        </div>
                      </div>
                      <ul className="space-y-2 ml-13">
                        {day.tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Member Onboarding
                </CardTitle>
                <CardDescription>How to welcome and activate new members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Welcome Post</h4>
                  <div className="space-y-3">
                    <CopyableSection title="Headline" content={plan.onboarding.welcome_post.headline} />
                    <CopyableSection title="Body" content={plan.onboarding.welcome_post.body} multiline />
                    <CopyableSection title="First Action" content={plan.onboarding.welcome_post.first_action} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Community Rules</h4>
                  <ol className="space-y-2">
                    {plan.onboarding.rules.map((rule, i) => (
                      <li key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                        <span className="text-sm"><strong>{i + 1}.</strong> {rule}</span>
                        <CopyButton text={rule} label={`Rule ${i + 1}`} />
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Weekly Schedule Post</h4>
                  <CopyableSection title="Headline" content={plan.onboarding.weekly_schedule_post.headline} />
                  <div className="mt-3 space-y-2">
                    {plan.onboarding.weekly_schedule_post.schedule.map((item, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg px-4 py-2 text-sm">{item}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">First Challenge Post</h4>
                  <div className="space-y-3">
                    <CopyableSection title="Headline" content={plan.onboarding.first_challenge_post.headline} />
                    <CopyableSection title="Challenge" content={plan.onboarding.first_challenge_post.challenge} multiline />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">How to Participate</p>
                      <ol className="space-y-2">
                        {plan.onboarding.first_challenge_post.how_to_participate.map((step, i) => (
                          <li key={i} className="bg-muted/50 rounded-lg px-4 py-2 text-sm">
                            <strong>Step {i + 1}:</strong> {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Onboarding Checklist</h4>
                  <ul className="space-y-2">
                    {plan.onboarding.checklist.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Daily Actions (First 7 Days)
                </CardTitle>
                <CardDescription>Your member acquisition action plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plan.first_20_members.daily_actions_7_days.map((day) => (
                    <div key={day.day} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="font-bold text-primary-foreground text-sm">{day.day}</span>
                        </div>
                        <p className="font-medium">Day {day.day}</p>
                      </div>
                      <ul className="space-y-2 ml-11">
                        {day.actions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Start building your Skool today</h3>
                <p className="text-muted-foreground">
                  The best time to start is now. Skool offers a free trial to get you going.
                </p>
              </div>
              <Button size="lg" asChild data-testid="button-start-skool-bottom">
                <a href={affiliateUrl} target="_blank" rel="noopener noreferrer">
                  Launch This on Skool — Free Trial
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-2">{plan.disclaimers.educational_notice}</p>
          <p className="text-sm text-muted-foreground">
            Need more help?{" "}
            <a 
              href="https://skoolprep.com/blog" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline hover:text-foreground"
            >
              Check out the Skool Prep blog
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>
          Made with care by Michael at{" "}
          <a 
            href="https://skoolprep.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-foreground"
          >
            skoolprep.com
          </a>
        </p>
      </footer>
    </div>
  );
}
