import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/publish/", "/stats/", "/biblioteca/"],
    },
    sitemap: "https://inkvoid.ink/sitemap.xml",
  };
}