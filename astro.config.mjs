import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://iandavis.dev",
  output: "static",
  integrations: [sitemap()],
});
