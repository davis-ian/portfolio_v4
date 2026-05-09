import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    metrics: z.string(),
    repoUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    order: z.number(),
  }),
});

export const collections = { projects };
