import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://kleis.atharvdangedev.in";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/dashboard"], // These are placeholders/private anyway
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
