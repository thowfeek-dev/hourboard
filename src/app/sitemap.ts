import type { MetadataRoute } from "next";
import { todayISO } from "@/lib/dates";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = todayISO();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return [
    { url: `${origin}/`, lastModified: today },
    { url: `${origin}/sign-in`, lastModified: today },
    { url: `${origin}/sign-up`, lastModified: today },
  ];
}
