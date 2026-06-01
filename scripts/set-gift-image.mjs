import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { createClient } from '@sanity/client';

// Attach a local image file to an existing gift document.
//   node scripts/set-gift-image.mjs <gift-slug> <path-to-image>

const [slug, imagePath] = process.argv.slice(2);
if (!slug || !imagePath) {
  throw new Error('Usage: node scripts/set-gift-image.mjs <gift-slug> <path-to-image>');
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error('Missing SANITY_STUDIO_PROJECT_ID in .env');
if (!token) throw new Error('Missing SANITY_WRITE_TOKEN in .env');

const client = createClient({ projectId, dataset, apiVersion: '2024-10-01', token, useCdn: false });

const giftId = await client.fetch('*[_type == "gift" && slug.current == $slug][0]._id', { slug });
if (!giftId) throw new Error(`No gift found with slug "${slug}"`);

console.log(`→ ${slug} (${giftId})`);
const buffer = await readFile(imagePath);
console.log(`  Uploading image (${buffer.byteLength} bytes)…`);
const asset = await client.assets.upload('image', buffer, { filename: basename(imagePath) });

await client
  .patch(giftId)
  .set({ image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } })
  .commit();

console.log(`  Done — attached ${asset._id}`);
