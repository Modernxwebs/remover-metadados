import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => data.lang === 'en' && !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Metadata Remover — Digital Privacy & Security Blog',
    description: 'Technical articles, research, and tutorials on EXIF metadata, photo GPS, PDFs, and digital privacy.',
    site: context.site || 'https://remover-metadados.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/en/blog/${post.id}/`,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
    })),
    customData: '<language>en</language>',
  });
}

