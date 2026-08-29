"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Hourboard hit a server error</h1>
      <p className="text-sm text-muted-foreground">
        Signed-in pages need a reachable Postgres database with the Hourboard tables created. If you just
        added Neon, wait for a new deploy (the build now runs <code>prisma db push</code>). Clerk
        development keys also need this site listed under allowed origins.
      </p>
      {error.message ? (
        <p className="max-w-full break-words rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground">
          {error.message}
        </p>
      ) : null}
      {error.digest ? (
        <p className="font-mono text-[11px] text-muted-foreground">Digest {error.digest}</p>
      ) : null}
      <button
        type="button"
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
