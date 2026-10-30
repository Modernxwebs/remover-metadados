import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Modern X Webs'),
    authorRole: z.string().default('Equipe do projeto'),
    category: z.string(),
    categorySlug: z.string().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['pt-BR', 'en']).default('pt-BR'),
    readTime: z.string().default('5 min de leitura'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    coverIcon: z.string().optional(),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
    translationId: z.string().optional(),
    relatedPosts: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
