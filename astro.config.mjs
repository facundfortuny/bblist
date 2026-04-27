// @ts-check
import { defineConfig } from 'astro/config';
import 'dotenv/config';

import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

if (!projectId) {
  throw new Error(
    'Missing SANITY_STUDIO_PROJECT_ID. Copy .env.example to .env and fill in the project ID from sanity.io/manage.',
  );
}

export default defineConfig({
  site: 'https://bblist.pages.dev',
  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion: '2024-10-01',
      useCdn: true,
      studioBasePath: '/studio',
      studioRouterHistory: 'hash',
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ['PUBLIC_', 'SANITY_STUDIO_'],
  },
});
