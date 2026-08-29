import Link from "next/link";
import { BarChart3, CalendarDays, Lock, Smartphone, Timer } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/animation/motion";
import { HeroArt } from "@/components/art/scene";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const FEATURES = [
  {
    icon: Timer,
    title: "Log finished hours",
    body: "Track work after you complete it. Hit an 8-hour day without a noisy timer.",
  },
  {
    icon: CalendarDays,
    title: "Day, week, month, year",
    body: "One private board that scales from today’s tickets to a year heatmap.",
  },
  {
    icon: BarChart3,
    title: "Charts that stay honest",
    body: "Streaks, weekday patterns, and project hours — only your data, only your stats.",
  },
  {
    icon: Lock,
    title: "Your board, only yours",
    body: "Every task, project, and export is scoped to your account. Sign in and it stays yours.",
  },
];

export function LandingPage() {
  return (
    <div className="relative z-10 min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: APP_NAME,
            applicationCategory: "ProductivityApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: "Private 8-hour work log with day, week, and year views.",
          }),
        }}
      />
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/" className="gradient-text text-sm font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="h-11 min-w-11 sm:h-9">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="h-11 sm:h-9">
              <Link href="/sign-up">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <FadeIn className="grid items-center gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Private work log</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              Your hours. <span className="gradient-text">Your board.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Hourboard is a personal SaaS planner for finished work. Sign in, log tickets toward an 8-hour day, and keep every day private to your account.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 w-full sm:w-auto">
                <Link href="/sign-up">Create your board</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 w-full sm:w-auto">
                <Link href="/sign-in">I already have an account</Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="size-4" aria-hidden />
              Built for phone, tablet, and desktop.
            </p>
          </div>
          <div className="flex justify-center rounded-2xl border border-border bg-card p-4 sm:p-6">
            <HeroArt />
          </div>
        </FadeIn>

        <Stagger className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="h-full rounded-xl border border-border bg-card p-5">
                <feature.icon className="size-5 text-primary" aria-hidden />
                <h2 className="mt-3 text-base font-semibold">{feature.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{feature.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <section className="mt-14 grid gap-4 md:grid-cols-2" aria-labelledby="pricing-heading">
          <div className="rounded-2xl border border-primary bg-card p-6">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Free</p>
            <h2 id="pricing-heading" className="mt-1 text-2xl font-semibold">
              Personal
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Unlimited tasks, projects, and exports on your private board. The plan you start on today.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Your own hours, days, and charts</li>
              <li>Import / export JSON, CSV, and PDF</li>
              <li>Works on mobile from day one</li>
            </ul>
            <Button asChild className="mt-6 h-12 w-full">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-6">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Soon</p>
            <h2 className="mt-1 text-2xl font-semibold">Teams</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Shared workspaces, invites, and billing. Same hour log — for a studio, not just one person.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Workspace members</li>
              <li>Shared projects</li>
              <li>Usage-based billing</li>
            </ul>
            <Button disabled variant="outline" className="mt-6 h-12 w-full">
              Coming later
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-sm text-muted-foreground">
        {APP_NAME} · private by default
      </footer>
    </div>
  );
}
