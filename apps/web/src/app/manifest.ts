import { siteConfig } from "@platform/config/site";
import { absoluteUrl } from "@platform/marketing/seo";
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: "Software design & engineering partner for regulated industries.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: absoluteUrl("/brand/sdk-logo-light.png"),
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
