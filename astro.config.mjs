import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://blog.naveenkhn.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    syntaxHighlight: 'prism'
  }
});
