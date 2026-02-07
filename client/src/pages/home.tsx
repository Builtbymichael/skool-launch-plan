import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Target, Users, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import logoImg from "@assets/Skool_Prep_Logo_(1)_1770489917211.png";
import { planFormSchema, type PlanFormInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

import screenshot1 from "@assets/Screenshot_2026-02-07_at_20.12.44_1770495649339.png";
import screenshot2 from "@assets/Screenshot_2026-02-07_at_20.12.49_1770495649341.png";
import screenshot3 from "@assets/Screenshot_2026-02-07_at_20.12.53_1770495649341.png";
import screenshot4 from "@assets/Screenshot_2026-02-07_at_20.12.57_1770495649342.png";
import screenshot5 from "@assets/Screenshot_2026-02-07_at_20.13.05_1770495649343.png";
import screenshot6 from "@assets/Screenshot_2026-02-07_at_20.13.08_1770495649344.png";
import screenshot7 from "@assets/Screenshot_2026-02-07_at_20.13.13_1770495649345.png";
import screenshot8 from "@assets/Screenshot_2026-02-07_at_20.13.17_1770495649346.png";

const EXAMPLE_SLIDES = [
  { src: screenshot1, label: "Positioning", description: "Community names, one-liner, and target audience" },
  { src: screenshot2, label: "Offer Structure", description: "Weekly structure, modules, and engagement loops" },
  { src: screenshot3, label: "First 20 Members", description: "Where to find them and outreach scripts" },
  { src: screenshot4, label: "Pricing Strategy", description: "Price range, free vs paid, and value math" },
  { src: screenshot5, label: "Copy Bank", description: "Hook lines, pain points, and objection handlers" },
  { src: screenshot6, label: "7-Day Launch", description: "Day-by-day roadmap with specific tasks" },
  { src: screenshot7, label: "Onboarding", description: "Welcome post, rules, and member checklist" },
  { src: screenshot8, label: "Daily Actions", description: "Your member acquisition action plan" },
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

function ExampleCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? EXAMPLE_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === EXAMPLE_SLIDES.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {EXAMPLE_SLIDES.map((slide, index) => (
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
            {slide.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 relative">
          <div className="relative overflow-hidden rounded-md">
            <img
              src={EXAMPLE_SLIDES[currentSlide].src}
              alt={`Example: ${EXAMPLE_SLIDES[currentSlide].label}`}
              className="w-full h-auto"
              data-testid="img-carousel-screenshot"
            />

            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover-elevate"
              data-testid="button-carousel-prev"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover-elevate"
              data-testid="button-carousel-next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 text-center">
            <p className="font-medium">{EXAMPLE_SLIDES[currentSlide].label}</p>
            <p className="text-sm text-muted-foreground">{EXAMPLE_SLIDES[currentSlide].description}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-1.5 mt-4">
        {EXAMPLE_SLIDES.map((_, index) => (
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
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Clear Positioning</h3>
              <p className="text-sm text-muted-foreground">Know exactly who you're helping and how</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">First 20 Members</h3>
              <p className="text-sm text-muted-foreground">Practical strategies to find your first audience</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">7-Day Launch Plan</h3>
              <p className="text-sm text-muted-foreground">Day-by-day actions to get started fast</p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
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

        <div className="mt-20 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">See what you'll get</h2>
            <p className="text-muted-foreground">
              Here's a real example plan we generated for a home carpentry niche
            </p>
          </div>

          <ExampleCarousel />
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
