import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, Copy, Check, ArrowLeft, Mail, ExternalLink, 
  Users, Target, DollarSign, Calendar, MessageSquare, 
  Rocket, BookOpen, CheckCircle2, Loader2 
} from "lucide-react";
import { type GeneratedPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import logoImg from "@assets/Skool_Prep_Logo_(1)_1770489917211.png";

interface AppConfig {
  affiliateUrl: string;
  emailEnabled: boolean;
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

export default function Plan() {
  const [, navigate] = useLocation();
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [email, setEmail] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
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

  const sendEmail = useMutation({
    mutationFn: async (emailAddress: string) => {
      const response = await apiRequest("POST", "/api/send-plan-email", {
        email: emailAddress,
        plan,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ description: "Plan sent to your email!" });
      setEmailDialogOpen(false);
      setEmail("");
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        description: err.message || "Failed to send email. Please try again.",
      });
    },
  });

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
  const emailEnabled = config?.emailEnabled ?? false;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create another plan
          </Button>
          <div className="flex items-center gap-2">
            {emailEnabled && (
              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-email-plan">
                    <Mail className="mr-2 h-4 w-4" />
                    Email this plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Email your launch plan</DialogTitle>
                    <DialogDescription>
                      We'll send the full plan to your inbox so you can reference it anytime.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-email"
                    />
                    <Button
                      className="w-full"
                      disabled={!email || sendEmail.isPending}
                      onClick={() => sendEmail.mutate(email)}
                      data-testid="button-send-email"
                    >
                      {sendEmail.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send plan to my email"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
                  Start free on Skool
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
                  Start free on Skool
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
          Made with care by{" "}
          <a 
            href="https://skoolprep.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-foreground"
          >
            Skool Prep
          </a>
        </p>
      </footer>
    </div>
  );
}
