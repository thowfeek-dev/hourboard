import { execSync } from "node:child_process";
import { applyPrismaEnv } from "../src/lib/database-url";

applyPrismaEnv();
execSync("npx prisma db push", { stdio: "inherit", env: process.env });
