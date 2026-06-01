import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error('Missing SANITY_STUDIO_PROJECT_ID in .env');
if (!token) {
  throw new Error(
    'Missing SANITY_WRITE_TOKEN in .env. Create one at sanity.io/manage → API → Tokens (Editor permission).',
  );
}

const gifts = [
  {
    title: 'Organizador asa ropa bebé rayas',
    description:
      'Organizador de tela de rayas con asa para colgar y compartimentos acolchados, ideal para guardar y tener a mano la ropa y los accesorios del bebé.',
    externalUrl:
      'https://www.zarahome.com/es/organizador-asa-ropa-bebe-rayas-l41632049',
    priceApprox: 25.99,
    category: 'otros',
    status: 'available',
    imagePath: '/Users/tuareg/Downloads/41632049802-a7.webp',
  },
];

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 96);

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-10-01',
  token,
  useCdn: false,
});

for (const gift of gifts) {
  console.log(`\n→ ${gift.title}`);

  let image;
  if (gift.imagePath || gift.imageUrl) {
    let imageBuffer;
    let imageFilename;

    if (gift.imagePath) {
      imageBuffer = await readFile(gift.imagePath);
      imageFilename = basename(gift.imagePath);
    } else {
      const imageRes = await fetch(gift.imageUrl);
      if (!imageRes.ok) {
        throw new Error(`Failed to download image (${imageRes.status}): ${gift.imageUrl}`);
      }
      imageBuffer = Buffer.from(await imageRes.arrayBuffer());
      imageFilename = gift.imageUrl.split('/').pop()?.split('?')[0] ?? 'gift.jpg';
    }

    console.log(`  Uploading image (${imageBuffer.byteLength} bytes)…`);
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: imageFilename,
    });
    image = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  } else {
    console.log('  No image — using the category illustration fallback.');
  }

  const doc = await client.create({
    _type: 'gift',
    title: gift.title,
    slug: { _type: 'slug', current: slugify(gift.title) },
    description: gift.description,
    externalUrl: gift.externalUrl,
    priceApprox: gift.priceApprox,
    category: gift.category,
    status: gift.status,
    ...(image ? { image } : {}),
  });

  console.log(`  Created ${doc._id} — slug: ${doc.slug.current}`);
}
