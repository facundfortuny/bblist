import { createClient } from '@sanity/client';

export interface Env {
  SANITY_STUDIO_PROJECT_ID: string;
  SANITY_STUDIO_DATASET?: string;
  SANITY_WRITE_TOKEN: string;
}

// A write-capable Sanity client built from Pages env vars. The token never
// reaches the browser — it only lives in the Cloudflare Pages runtime.
export function sanity(env: Env) {
  return createClient({
    projectId: env.SANITY_STUDIO_PROJECT_ID,
    dataset: env.SANITY_STUDIO_DATASET ?? 'production',
    apiVersion: '2024-10-01',
    token: env.SANITY_WRITE_TOKEN,
    useCdn: false,
  });
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
