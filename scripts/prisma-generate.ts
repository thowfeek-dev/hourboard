import { execSync } from "node:child_process";
import { applyPrismaEnv } from "../src/lib/database-url";

applyPrismaEnv();
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/hourboard";
}
execSync("npx prisma generate", { stdio: "inherit", env: process.env });
