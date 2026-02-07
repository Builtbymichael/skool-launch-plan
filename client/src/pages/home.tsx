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
import { Loader2, Sparkles, Target, Users, Lightbulb } from "lucide-react";
import logoImg from "@assets/Skool_Prep_Logo_(1)_1770489917211.png";
import { planFormSchema, type PlanFormInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

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
