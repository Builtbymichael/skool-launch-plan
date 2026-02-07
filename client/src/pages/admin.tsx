import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, TrendingUp, Lock, Loader2, Mail } from "lucide-react";
import logoImg from "@assets/Skool_Prep_Logo_(1)_1770489917211.png";

interface AdminStats {
  todayGenerations: number;
  totalSearches: number;
  topTopics: Array<{ topic: string; count: number }>;
  emailSubscribers: number;
}

export default function Admin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pwdParam = params.get("pwd");
    if (pwdParam) {
      setPassword(pwdParam);
      handleAuth(pwdParam);
    }
  }, []);

  const handleAuth = async (pwd?: string) => {
    const pwdToCheck = pwd || password;
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwdToCheck }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
        setAuthError("");
      } else {
        setAuthError("Invalid password");
        setIsAuthenticated(false);
      }
    } catch {
      setAuthError("Failed to verify password");
    }
  };

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats", password],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", {
        headers: { "X-Admin-Password": password },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center" data-testid="link-home-logo">
                <img src={logoImg} alt="Skool Prep" className="w-8 h-8 rounded-md" />
              </a>
              <span className="font-semibold text-lg">Admin Dashboard</span>
            </div>
            <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-16">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>Enter the admin password to view analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                data-testid="input-admin-password"
              />
              {authError && (
                <p className="text-sm text-destructive text-center" data-testid="text-auth-error">{authError}</p>
              )}
              <Button className="w-full" onClick={() => handleAuth()} data-testid="button-login">
                Access Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center" data-testid="link-home-logo">
              <img src={logoImg} alt="Skool Prep" className="w-8 h-8 rounded-md" />
            </a>
            <span className="font-semibold text-lg">Admin Dashboard</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Today's Generations</CardDescription>
                  <CardTitle className="text-4xl flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <span data-testid="text-today-generations">{stats?.todayGenerations || 0}</span>
                    <span className="text-lg text-muted-foreground font-normal">/ 100</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Global daily limit usage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Topic Searches</CardDescription>
                  <CardTitle className="text-4xl flex items-center gap-2">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <span data-testid="text-total-searches">{stats?.totalSearches || 0}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All-time unique topics searched
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Email Subscribers</CardDescription>
                  <CardTitle className="text-4xl flex items-center gap-2">
                    <Mail className="h-8 w-8 text-primary" />
                    <span data-testid="text-email-subscribers">{stats?.emailSubscribers || 0}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Users who emailed their plan
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Searched Topics</CardTitle>
                <CardDescription>
                  Most popular topics people are exploring (aggregated, no personal data)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.topTopics && stats.topTopics.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topTopics.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3"
                        data-testid={`topic-row-${i}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-6">
                            #{i + 1}
                          </span>
                          <span className="text-sm">{item.topic}</span>
                        </div>
                        <Badge variant="secondary">{item.count} searches</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No topic data yet. Topics will appear here as users generate plans.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
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
