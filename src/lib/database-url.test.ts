import { describe, expect, it } from "vitest";
import { sanitizeDatabaseUrl, toDirectDatabaseUrl } from "@/lib/database-url";

describe("database-url", () => {
  it("strips channel_binding and adds pgbouncer on Neon pooler hosts", () => {
    const raw =
      "postgresql://u:p@ep-foo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    const sanitized = sanitizeDatabaseUrl(raw);
    expect(sanitized).not.toContain("channel_binding");
    expect(sanitized).toContain("pgbouncer=true");
    expect(sanitized).toContain("connection_limit=1");
  });

  it("derives a non-pooler DIRECT_URL", () => {
    const raw = "postgresql://u:p@ep-foo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
    expect(toDirectDatabaseUrl(raw)).toContain("ep-foo.us-east-2.aws.neon.tech");
    expect(toDirectDatabaseUrl(raw)).not.toContain("-pooler.");
  });
});
