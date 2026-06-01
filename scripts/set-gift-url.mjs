import 'dotenv/config';
import { createClient } from '@sanity/client';

// Update the external (buy) link of an existing gift.
//   node scripts/set-gift-url.mjs <gift-slug> <url>

const [slug, url] = process.argv.slice(2);
if (!slug || !url) {
  throw new Error('Usage: node scripts/set-gift-url.mjs <gift-slug> <url>');
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error('Missing SANITY_STUDIO_PROJECT_ID in .env');
if (!token) throw new Error('Missing SANITY_WRITE_TOKEN in .env');

const client = createClient({ projectId, dataset, apiVersion: '2024-10-01', token, useCdn: false });

const giftId = await client.fetch('*[_type == "gift" && slug.current == $slug][0]._id', { slug });
if (!giftId) throw new Error(`No gift found with slug "${slug}"`);

await client.patch(giftId).set({ externalUrl: url }).commit();
console.log(`→ ${slug} (${giftId})\n  externalUrl = ${url}`);
