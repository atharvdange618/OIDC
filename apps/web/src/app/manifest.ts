import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kleis - OIDC for Next.js",
    short_name: "Kleis",
    description: "Standards-compliant OIDC provider and Next.js SDK.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#60B5FF",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
