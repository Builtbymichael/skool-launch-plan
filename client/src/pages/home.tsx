import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Target, Users, ChevronLeft, ChevronRight, BookOpen, DollarSign, MessageSquare, Rocket, CheckCircle2, Calendar } from "lucide-react";
import logoImg from "@assets/Skool_Prep_Logo_(1)_1770489917211.png";
import { planFormSchema, type PlanFormInput, type GeneratedPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const EXAMPLE_PLAN: GeneratedPlan = {
  meta: {
    topic: "Home Carpentry & Woodworking",
    outcome_30_90: "Build your first piece of custom furniture from scratch",
    audience_level: "beginners",
    background: "done_myself",
    recommended_path: "community_plus_course",
  },
  positioning: {
    community_name_options: ["The Workshop Guild", "Sawdust & Skills", "Build It Better", "Woodcraft Beginners"],
    one_liner: "Learn to build real furniture from scratch, even if you've never picked up a saw.",
    who_its_for: [
      "Complete beginners who want to start woodworking at home",
      "DIY enthusiasts who want to move beyond flat-pack furniture",
      "Parents who want to build things with their kids",
      "Anyone with a garage or small workshop space",
    ],
    who_its_not_for: [
      "Professional carpenters looking for advanced techniques",
      "People looking for quick furniture assembly tips",
      "Those without any workspace or basic tool access",
    ],
    transformation_promise: "In 90 days, you'll go from zero woodworking experience to confidently building your first custom bookshelf or side table, with the skills and confidence to tackle bigger projects on your own.",
  },
  offer: {
    format_explainer: "A community-first approach with a structured course component. Members get weekly live workshops, a step-by-step beginner curriculum, and access to a supportive community of fellow beginners sharing their builds and asking questions.",
    weekly_structure: {
      cadence: "New module content drops every Monday. Live Q&A every Wednesday. Build showcase every Friday.",
      weekly_events: [
        "Monday: New lesson + technique video",
        "Wednesday: Live Q&A and troubleshooting session",
        "Friday: Member build showcase and feedback",
      ],
      weekly_posts: [
        "Tool Tip Tuesday: one practical tip per week",
        "Work-in-Progress Wednesday: share your current build",
        "Finish Friday: celebrate completed projects",
      ],
      accountability_loop: "Members post a photo of their weekly progress every Sunday. The community votes on 'Build of the Week' which gets featured in the Monday newsletter.",
    },
    example_modules_or_themes: [
      "Workshop Setup on a Budget",
      "Hand Tool Fundamentals",
      "Wood Selection & Grain Reading",
      "Measuring, Marking & Cutting",
      "Joinery Basics: Dowels & Pocket Holes",
      "Your First Shelf Build",
    ],
    content_types: ["Video tutorials", "Step-by-step plans (PDF)", "Live workshops", "Tool reviews", "Member Q&A recordings"],
    engagement_loops: [
      "Weekly build challenges with community voting",
      "Tool of the month deep-dive discussions",
      "Before/after project transformations",
      "Mentorship pairing for accountability",
    ],
  },
  first_20_members: {
    where_to_find_them: [
      "Reddit: r/woodworking, r/BeginnerWoodWorking",
      "Facebook Groups: Woodworking for Beginners",
      "YouTube comments on beginner woodworking videos",
      "Local hardware store workshop events",
      "Instagram: #beginnerwoodworking",
      "Nextdoor neighborhood groups",
    ],
    outreach_script_variants: [
      {
        channel: "Reddit DM",
        script: "Hey! I saw your post about getting started with woodworking. I'm building a small community of beginners who are working through projects together. We do weekly live workshops and share our builds. Would you be interested in joining? It's free to start.",
      },
      {
        channel: "Facebook",
        script: "Hi there! I noticed you're interested in getting into woodworking. I run a small group called The Workshop Guild where beginners build their first furniture projects together with step-by-step guidance. Would love to have you check it out!",
      },
    ],
    intro_post_template: {
      headline: "I went from zero woodworking experience to building custom furniture. Here's how you can too.",
      body: "6 months ago, I couldn't tell a dowel from a dovetail. Last week, I finished a custom dining table for my family. The secret wasn't talent or expensive tools. It was having a clear plan, the right techniques in the right order, and a group of people building alongside me.",
      call_to_action: "I'm opening up 20 spots in my free beginner woodworking community. Comment 'BUILD' if you want in.",
    },
    daily_actions_7_days: [
      { day: 1, actions: ["Post in 3 Reddit woodworking threads with genuine advice", "Comment on 10 beginner woodworking YouTube videos", "Share your own beginner story on Instagram"] },
      { day: 2, actions: ["DM 5 people who engaged with woodworking content", "Post a tool tip in a Facebook group", "Reply to all comments from Day 1"] },
      { day: 3, actions: ["Share a before/after of a simple project", "Engage in 3 new Reddit threads", "DM 5 more interested people"] },
      { day: 4, actions: ["Host a quick Instagram Live showing a simple technique", "Follow up with all DM conversations", "Post in Nextdoor about a local meetup idea"] },
      { day: 5, actions: ["Share a helpful PDF guide in Facebook groups", "DM 5 more people from engaged comments", "Post a poll about what projects people want to build"] },
      { day: 6, actions: ["Reply to every comment and DM from the week", "Share a 'what I learned this week' post", "Invite warm leads to your community"] },
      { day: 7, actions: ["Compile your best content from the week", "Send personal invites to your top 10 engaged people", "Plan next week's content based on questions received"] },
    ],
  },
  pricing: {
    suggested_price_range: "$29-49/month after free trial period",
    free_vs_paid_strategy: "Start with a free community to build trust and gather your first 20 members. After 30 days, introduce a paid tier ($29/mo) that includes the structured course modules, live workshops, and downloadable project plans. Keep a free tier with limited access to community posts only.",
    when_to_add_course: "Add a structured course once you have 10+ active members asking similar questions. Package your most-requested topics into a 6-week curriculum. This becomes your premium offering at $49/mo or a one-time $197 purchase.",
    simple_value_math: "A single woodworking class at a local shop costs $50-150. A beginner tool set guide alone saves members $200+ in avoided mistakes. At $29/month, members get weekly live instruction, a full curriculum, and community support for less than the cost of one in-person class.",
  },
  copy_bank: {
    hook_lines: [
      "You don't need a fancy workshop to build real furniture.",
      "Stop watching YouTube tutorials and start building.",
      "Your first project doesn't have to be perfect. It has to be finished.",
      "What if you could build your own furniture in 90 days?",
    ],
    pain_point_phrases: [
      "Overwhelmed by conflicting advice on which tools to buy first",
      "Watched 100 YouTube videos but still haven't started a project",
      "Afraid of wasting expensive wood on beginner mistakes",
      "No idea where to start or what order to learn things in",
    ],
    objection_handlers: [
      "\"I don't have the right tools.\" You only need 5 basic tools to start. We'll show you exactly which ones and where to get them affordably.",
      "\"I don't have space.\" Our Workshop Setup module shows you how to build in a single-car garage or even a large closet. Many members work on a folding workbench.",
      "\"I'm not handy at all.\" Perfect. This is designed for complete beginners. If you can follow a recipe, you can follow our build plans.",
    ],
    about_page_template: {
      headline: "Build Real Furniture. No Experience Required.",
      subheadline: "A step-by-step woodworking community for absolute beginners who want to create something real with their hands.",
      bullets: [
        "Follow along with structured, beginner-friendly build projects",
        "Get live help from experienced builders every week",
        "Join a supportive community of people at your level",
        "Download detailed plans and cut lists for every project",
      ],
      how_it_works: [
        "Join the community and introduce yourself",
        "Follow the Starter Module to set up your workspace",
        "Build your first project with step-by-step guidance",
        "Share your progress and get feedback from the community",
      ],
      who_this_is_for: [
        "Complete beginners with no woodworking experience",
        "DIY enthusiasts ready to level up from flat-pack",
        "Parents who want a productive hands-on hobby",
      ],
      call_to_action: "Join The Workshop Guild - Start Building Today",
    },
  },
  launch_plan_7_days: [
    { day: 1, goal: "Set up your Skool community", tasks: ["Create your Skool group with name, description, and cover image", "Set up the classroom with your first module outline", "Write your welcome post and pin it", "Configure community rules"] },
    { day: 2, goal: "Create your lead magnet", tasks: ["Write a '5 Essential Tools for Beginner Woodworkers' PDF guide", "Create 2-3 social media posts promoting it", "Set up a simple landing page or link in bio"] },
    { day: 3, goal: "Start outreach", tasks: ["Post in 5 relevant Reddit threads with genuine advice", "Join 3 Facebook groups and provide value", "DM 10 people who've shown interest in beginner woodworking"] },
    { day: 4, goal: "Create your first content piece", tasks: ["Record a 5-minute 'Your First Project' overview video", "Post it in your Skool community", "Share a teaser clip on social media"] },
    { day: 5, goal: "Ramp up engagement", tasks: ["Follow up with all DM conversations", "Post a poll asking what projects people want to build first", "Share a behind-the-scenes of your own workshop"] },
    { day: 6, goal: "Host your first live event", tasks: ["Schedule and promote a live Q&A session", "Prepare 3 common beginner questions to address", "Record it and post the replay in your classroom"] },
    { day: 7, goal: "Review and plan ahead", tasks: ["Check your member count and engagement metrics", "Send personal messages to your most engaged members", "Plan next week's content based on member questions", "Celebrate your launch!"] },
  ],
  onboarding: {
    welcome_post: {
      headline: "Welcome to The Workshop Guild! Start here.",
      body: "You're in! Whether you've never touched a saw or you're ready to level up from basic DIY, you're in the right place. This community is all about learning woodworking step by step, together. No judgment, no gatekeeping, just people helping each other build cool stuff.",
      first_action: "Drop a comment below and tell us: what's the first thing you'd love to build? A shelf? A desk? A birdhouse? There's no wrong answer!",
    },
    rules: [
      "Be supportive. We were all beginners once.",
      "Share your progress, even if it's messy. Especially if it's messy.",
      "Ask questions freely. The only bad question is the one you don't ask.",
      "No gatekeeping or tool snobbery. Budget tools are welcome here.",
      "Keep it on topic. Woodworking, tools, projects, and workshop setups.",
    ],
    weekly_schedule_post: {
      headline: "Your Weekly Workshop Schedule",
      schedule: [
        "Monday: New lesson drops in the classroom",
        "Tuesday: Tool Tip Tuesday post",
        "Wednesday: Live Q&A at 7pm EST + WIP Wednesday",
        "Friday: Finish Friday - show off completed work",
        "Sunday: Post your weekly progress photo",
      ],
    },
    first_challenge_post: {
      headline: "7-Day Workshop Setup Challenge",
      challenge: "This week, let's all set up (or improve) our workspace. It doesn't matter if it's a full garage workshop or a corner of your apartment. The goal is to have a dedicated space where you can build, no matter how small.",
      how_to_participate: [
        "Take a 'before' photo of your current workspace (or empty space)",
        "Follow the Workshop Setup module for layout and tool organization tips",
        "Post your 'after' photo by Sunday",
        "Vote on the best transformation of the week",
      ],
    },
    checklist: [
      "Read the welcome post and introduce yourself",
      "Check out the Workshop Setup module",
      "Post your first question or project idea",
      "Join the Wednesday live Q&A",
      "Share a photo of your workspace",
    ],
  },
  disclaimers: {
    educational_notice: "This plan is a starting point based on AI analysis. Results depend on your effort, niche, and execution. Always validate with your own research.",
  },
};

const EXAMPLE_SECTIONS = [
  { key: "positioning", label: "Positioning", description: "Community names, one-liner, and target audience", icon: Target },
  { key: "offer", label: "Offer Structure", description: "Weekly structure, modules, and engagement loops", icon: BookOpen },
  { key: "members", label: "First 20 Members", description: "Where to find them and outreach scripts", icon: Users },
  { key: "pricing", label: "Pricing Strategy", description: "Price range, free vs paid, and value math", icon: DollarSign },
  { key: "copy", label: "Copy Bank", description: "Hook lines, pain points, and objection handlers", icon: MessageSquare },
  { key: "launch", label: "7-Day Launch", description: "Day-by-day roadmap with specific tasks", icon: Rocket },
  { key: "onboarding", label: "Onboarding", description: "Welcome post, rules, and member checklist", icon: CheckCircle2 },
  { key: "actions", label: "Daily Actions", description: "Your member acquisition action plan", icon: Calendar },
];

const LOADING_MESSAGES = [
  "Analysing your topic and niche...",
  "Checking current Skool communities...",
  "Deciding on potential names...",
  "Crafting your positioning statement...",
  "Identifying your ideal audience...",
  "Working out best pricing strategies...",
  "Building your 7-day launch plan...",
  "Finding where your first members hang out...",
  "Writing outreach scripts for you...",
  "Creating your copy bank...",
  "Designing your onboarding flow...",
  "Setting up your weekly structure...",
  "Preparing engagement loops...",
  "Polishing your launch blueprint...",
  "Almost there, putting it all together...",
];

function SampleWatermark() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
      <div className="rotate-[-30deg] select-none">
        <span className="text-6xl md:text-8xl font-black tracking-widest text-foreground/[0.06] uppercase">
          SAMPLE
        </span>
      </div>
    </div>
  );
}

function PreviewPositioning() {
  const p = EXAMPLE_PLAN.positioning;
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2 text-sm">Community Name Ideas</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {p.community_name_options.map((name, i) => (
            <div key={i} className="bg-muted/50 rounded-md px-3 py-1.5 text-xs">{name}</div>
          ))}
        </div>
      </div>
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">One-liner</p>
        <p className="text-xs font-medium">{p.one_liner}</p>
      </div>
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Transformation Promise</p>
        <p className="text-xs">{p.transformation_promise}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <h4 className="font-medium mb-1.5 text-xs">Who it's for</h4>
          <ul className="space-y-1">
            {p.who_its_for.map((item, i) => (
              <li key={i} className="flex items-start gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-1.5 text-xs">Who it's not for</h4>
          <ul className="space-y-1">
            {p.who_its_not_for.map((item, i) => (
              <li key={i} className="flex items-start gap-1 text-[11px] text-muted-foreground">
                <span className="text-destructive text-xs">&#10005;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PreviewOffer() {
  const o = EXAMPLE_PLAN.offer;
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Format</p>
        <p className="text-xs">{o.format_explainer}</p>
      </div>
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Weekly Events</h4>
        <ul className="space-y-1">
          {o.weekly_structure.weekly_events.map((e, i) => (
            <li key={i} className="text-[11px] bg-muted/50 rounded-md px-3 py-1.5">{e}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Modules</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {o.example_modules_or_themes.map((m, i) => (
            <div key={i} className="bg-muted/50 rounded-md px-3 py-1.5 text-[11px]">{m}</div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Content Types</h4>
        <div className="flex flex-wrap gap-1">
          {o.content_types.map((t, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewMembers() {
  const m = EXAMPLE_PLAN.first_20_members;
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Where to Find Them</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {m.where_to_find_them.map((p, i) => (
            <div key={i} className="bg-muted/50 rounded-md px-3 py-1.5 text-[11px]">{p}</div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Outreach Scripts</h4>
        {m.outreach_script_variants.map((s, i) => (
          <div key={i} className="bg-muted/50 rounded-md p-3 mb-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 mb-1">{s.channel}</Badge>
            <p className="text-[11px]">{s.script}</p>
          </div>
        ))}
      </div>
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Intro Post Template</h4>
        <div className="bg-muted/50 rounded-md p-3 space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground">Headline</p>
          <p className="text-xs font-medium">{m.intro_post_template.headline}</p>
          <p className="text-[10px] font-medium text-muted-foreground">Body</p>
          <p className="text-[11px]">{m.intro_post_template.body}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewPricing() {
  const pr = EXAMPLE_PLAN.pricing;
  return (
    <div className="space-y-3">
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Suggested Price Range</p>
        <p className="text-sm font-semibold">{pr.suggested_price_range}</p>
      </div>
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Free vs Paid Strategy</p>
        <p className="text-[11px]">{pr.free_vs_paid_strategy}</p>
      </div>
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">When to Add a Course</p>
        <p className="text-[11px]">{pr.when_to_add_course}</p>
      </div>
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Simple Value Math</p>
        <p className="text-[11px]">{pr.simple_value_math}</p>
      </div>
    </div>
  );
}

function PreviewCopyBank() {
  const c = EXAMPLE_PLAN.copy_bank;
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Hook Lines</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {c.hook_lines.map((h, i) => (
            <div key={i} className="bg-muted/50 rounded-md px-3 py-1.5 text-[11px]">{h}</div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Pain Points</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {c.pain_point_phrases.map((p, i) => (
            <div key={i} className="bg-muted/50 rounded-md px-3 py-1.5 text-[11px]">{p}</div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Objection Handlers</h4>
        {c.objection_handlers.map((o, i) => (
          <div key={i} className="bg-muted/50 rounded-md p-3 mb-2">
            <p className="text-[11px]">{o}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewLaunch() {
  const days = EXAMPLE_PLAN.launch_plan_7_days;
  return (
    <div className="space-y-3">
      {days.map((d) => (
        <div key={d.day} className="border rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary text-xs">{d.day}</span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Day {d.day}</p>
              <p className="text-xs font-medium">{d.goal}</p>
            </div>
          </div>
          <ul className="space-y-1 ml-9">
            {d.tasks.map((t, i) => (
              <li key={i} className="flex items-start gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PreviewOnboarding() {
  const ob = EXAMPLE_PLAN.onboarding;
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Welcome Post</h4>
        <div className="bg-muted/50 rounded-md p-3 space-y-1.5">
          <p className="text-xs font-medium">{ob.welcome_post.headline}</p>
          <p className="text-[11px]">{ob.welcome_post.body}</p>
          <p className="text-[10px] font-medium text-muted-foreground mt-1">First action:</p>
          <p className="text-[11px]">{ob.welcome_post.first_action}</p>
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Community Rules</h4>
        <ol className="space-y-1">
          {ob.rules.map((r, i) => (
            <li key={i} className="bg-muted/50 rounded-md px-3 py-1.5 text-[11px]">
              <strong>{i + 1}.</strong> {r}
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h4 className="font-medium mb-1.5 text-xs">Onboarding Checklist</h4>
        <ul className="space-y-1">
          {ob.checklist.map((c, i) => (
            <li key={i} className="flex items-start gap-1 text-[11px]">
              <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PreviewDailyActions() {
  const days = EXAMPLE_PLAN.first_20_members.daily_actions_7_days;
  return (
    <div className="space-y-3">
      {days.map((d) => (
        <div key={d.day} className="border rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-[10px]">{d.day}</span>
            </div>
            <p className="text-xs font-medium">Day {d.day}</p>
          </div>
          <ul className="space-y-1 ml-8">
            {d.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const PREVIEW_COMPONENTS: Record<string, () => JSX.Element> = {
  positioning: PreviewPositioning,
  offer: PreviewOffer,
  members: PreviewMembers,
  pricing: PreviewPricing,
  copy: PreviewCopyBank,
  launch: PreviewLaunch,
  onboarding: PreviewOnboarding,
  actions: PreviewDailyActions,
};

function ExampleCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? EXAMPLE_SECTIONS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === EXAMPLE_SECTIONS.length - 1 ? 0 : prev + 1));
  };

  const current = EXAMPLE_SECTIONS[currentSlide];
  const IconComponent = current.icon;
  const PreviewComponent = PREVIEW_COMPONENTS[current.key];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {EXAMPLE_SECTIONS.map((section, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              currentSlide === index
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover-elevate"
            }`}
            data-testid={`button-carousel-tab-${index}`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <IconComponent className="h-4 w-4 text-primary" />
            {current.label}
          </CardTitle>
          <CardDescription className="text-xs">{current.description}</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <SampleWatermark />
          <div className="relative" data-testid="preview-content">
            <PreviewComponent />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={prevSlide}
          className="bg-muted rounded-full p-2 hover-elevate"
          data-testid="button-carousel-prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {EXAMPLE_SECTIONS.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              data-testid={`button-carousel-dot-${index}`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="bg-muted rounded-full p-2 hover-elevate"
          data-testid="button-carousel-next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<PlanFormInput>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      topic: "",
      outcome: "",
      audienceLevel: "",
      background: "",
    },
  });

  const generatePlan = useMutation({
    mutationFn: async (data: PlanFormInput) => {
      const response = await apiRequest("POST", "/api/generate-plan", data);
      return response.json();
    },
    onSuccess: (data) => {
      stopLoadingMessages();
      sessionStorage.setItem("generatedPlan", JSON.stringify(data));
      navigate("/plan");
    },
    onError: (err: Error) => {
      stopLoadingMessages();
      setError(err.message || "Something went wrong. Please try again.");
    },
  });

  const stopLoadingMessages = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  };

  const startLoadingMessages = () => {
    setLoadingMessageIndex(0);
    loadingIntervalRef.current = setInterval(() => {
      setLoadingMessageIndex((prev) => 
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3000);
  };

  useEffect(() => {
    return () => stopLoadingMessages();
  }, []);

  const onSubmit = (data: PlanFormInput) => {
    setError(null);
    startLoadingMessages();
    generatePlan.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2" data-testid="link-home-logo">
            <img src={logoImg} alt="Skool Prep" className="w-8 h-8 rounded-md" />
          </a>
          <a
            href="https://skoolprep.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
            data-testid="link-skoolprep"
          >
            by skoolprep.com
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Turn Your Idea Into a{" "}
            <span className="text-primary">Skool Launch Plan</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get a practical, step-by-step blueprint to launch your Skool community or course 
            and find your first 20 members. No hype, just a solid starting point.
          </p>
          <Button
            size="lg"
            className="mt-6"
            data-testid="button-cta-create"
            onClick={() => document.getElementById("create-plan-form")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Rocket className="w-4 h-4 mr-2" />
            Create Your Free Plan
          </Button>
        </div>

        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">See what you'll get</h2>
            <p className="text-muted-foreground">
              Here's a live preview of a plan we generated for a home carpentry niche
            </p>
          </div>

          <ExampleCarousel />
        </div>

        <Card id="create-plan-form" className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Your Launch Plan</CardTitle>
            <CardDescription>
              Fill in the details below and we'll generate a customized blueprint for your Skool community or course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What topic or niche do you want to build around?</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-topic"
                          placeholder="e.g., Fitness for busy dads, Learning Python, Helping people quit vaping"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What result should members achieve in 30-90 days?</FormLabel>
                      <FormControl>
                        <Textarea
                          data-testid="input-outcome"
                          placeholder="e.g., Lose 10lb, Ship first freelance project, Pass job interviews"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific about the transformation you'll help them achieve
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who do you want to help? (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-audience">
                            <SelectValue placeholder="Select your target audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginners">Beginners</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="professionals">Professionals</SelectItem>
                          <SelectItem value="career_switchers">Career Switchers</SelectItem>
                          <SelectItem value="parents">Parents</SelectItem>
                          <SelectItem value="students">Students</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="background"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's your background? (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-background">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="done_myself">I've done this myself</SelectItem>
                          <SelectItem value="help_others">I help others with this</SelectItem>
                          <SelectItem value="learning">I'm learning and documenting it</SelectItem>
                          <SelectItem value="have_audience">I already have an audience</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 text-sm" data-testid="text-error">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={generatePlan.isPending}
                  data-testid="button-submit"
                >
                  {generatePlan.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Create my Skool launch plan
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            By using this tool, you agree to our{" "}
            <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
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
