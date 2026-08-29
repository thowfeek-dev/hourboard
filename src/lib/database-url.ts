/** Neon/Prisma-friendly URL: drop channel_binding, enable pgbouncer on pooler hosts. */
export function sanitizeDatabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    url.searchParams.delete("channel_binding");
    if (isPoolerHost(url.hostname)) {
      url.searchParams.set("pgbouncer", "true");
      url.searchParams.set("connection_limit", "1");
    }
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return trimmed.replace(/([?&])channel_binding=require&?/g, "$1").replace(/[?&]$/, "");
  }
}

export function toDirectDatabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    url.hostname = url.hostname.replace("-pooler.", ".");
    url.searchParams.delete("channel_binding");
    url.searchParams.delete("pgbouncer");
    url.searchParams.delete("connection_limit");
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return sanitizeDatabaseUrl(trimmed).replace("-pooler.", ".");
  }
}

export function applyPrismaEnv() {
  const original = process.env.DATABASE_URL?.trim();
  if (!original) return;
  process.env.DATABASE_URL = sanitizeDatabaseUrl(original);
  if (!process.env.DIRECT_URL?.trim()) {
    process.env.DIRECT_URL = toDirectDatabaseUrl(original);
  }
}

function isPoolerHost(hostname: string) {
  return hostname.includes("-pooler.") || hostname.startsWith("pooler.");
}
