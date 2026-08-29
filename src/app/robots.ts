import type { MetadataRoute } from "next";
import { appOrigin } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const origin = appOrigin();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
