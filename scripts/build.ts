import { execSync } from "node:child_process";
import { applyPrismaEnv } from "../src/lib/database-url";

applyPrismaEnv();

execSync("npx prisma generate", { stdio: "inherit", env: process.env });

if (process.env.DATABASE_URL) {
  execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: process.env });
} else {
  console.warn("Skipping prisma db push (DATABASE_URL is not set).");
}

execSync("npx next build", { stdio: "inherit", env: process.env });
