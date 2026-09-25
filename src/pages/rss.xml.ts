import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => data.lang === 'pt-BR' && !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Remover Metadados — Blog de Privacidade e Segurança Digital',
    description: 'Artigos técnicos, pesquisas e tutoriais sobre metadados EXIF, GPS em fotos, PDFs e sigilo digital.',
    site: context.site || 'https://remover-metadados.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
    })),
    customData: '<language>pt-BR</language>',
  });
}
