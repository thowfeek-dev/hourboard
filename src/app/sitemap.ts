import type { MetadataRoute } from "next";
import { appOrigin } from "@/lib/constants";
import { todayISO } from "@/lib/dates";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = todayISO();
  const origin = appOrigin();
  return [
    { url: `${origin}/`, lastModified: today },
    { url: `${origin}/sign-in`, lastModified: today },
    { url: `${origin}/sign-up`, lastModified: today },
  ];
}
