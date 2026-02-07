import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import logoImg from "@assets/Skool_Prep_Logo_(1)_1770489917211.png";

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2" data-testid="link-home-logo">
            <img src={logoImg} alt="Skool Prep" className="w-8 h-8 rounded-md" />
          </a>
          <div className="flex items-center gap-4">
            <a
              href="https://skoolprep.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="link-skoolprep"
            >
              by skoolprep.com
            </a>
            <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground">Last updated: February 2025</p>

            <h2 className="text-lg font-semibold mt-6 mb-3">What Data We Collect</h2>
            <p>
              The Skool Launch Plan Creator collects minimal data to provide our service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Topic Information:</strong> The topic, outcome, audience level, and background you enter 
                in the form are stored temporarily for analytics purposes. This helps us understand what types 
                of communities people are interested in building.
              </li>
              <li>
                <strong>Rate Limit Data:</strong> We store a hashed (anonymized) version of your IP address and 
                browser information to enforce rate limits. This hash cannot be reversed to identify you.
              </li>
              <li>
                <strong>Email Address (Optional):</strong> If you choose to email yourself the plan, we temporarily 
                process your email address to send the plan. We do not store your email address after sending.
              </li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To generate your personalized Skool launch plan</li>
              <li>To prevent abuse through rate limiting</li>
              <li>To understand aggregate usage patterns (e.g., popular topics)</li>
              <li>To send you the plan via email if you request it</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">What We Don't Do</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We don't sell or share your data with third parties</li>
              <li>We don't create user accounts or track you across sessions</li>
              <li>We don't use cookies for tracking purposes</li>
              <li>We don't store your email address after sending the plan</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>OpenAI:</strong> To generate your launch plan. Your topic and inputs are sent to OpenAI's 
                API for processing. See{" "}
                <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  OpenAI's Privacy Policy
                </a>.
              </li>
              <li>
                <strong>Resend (if enabled):</strong> To deliver emails. See{" "}
                <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Resend's Privacy Policy
                </a>.
              </li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Rate limit data is reset daily</li>
              <li>Topic searches are stored indefinitely for aggregate analytics</li>
              <li>Generated plans are not stored on our servers (only in your browser session)</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">Contact</h2>
            <p>
              If you have questions about this privacy policy, please visit{" "}
              <a href="https://skoolprep.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                skoolprep.com
              </a>{" "}
              to get in touch.
            </p>
          </CardContent>
        </Card>
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
