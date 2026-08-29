import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function AuthScreen({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-background px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <header className="mx-auto flex h-14 w-full max-w-md items-center justify-between">
        <Link href="/" className="gradient-text text-sm font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <Link href="/" className="text-sm text-muted-foreground">
          Back
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </div>
  );
}
