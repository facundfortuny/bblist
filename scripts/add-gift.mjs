import 'dotenv/config';
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
    title: 'Sac niu oval de mussolina musgo',
    description:
      "Sac niu oval de mussolina que abraça el nadó i l'aïlla del fred i del soroll, mantenint-li el capet protegit. La cremallera frontal permet embolicar i desembolicar-lo sense despertar-lo. Color musgo (verd), versió d'hivern.",
    externalUrl:
      'https://minicoton.com/en/products/oval-muslin-moss-bag-2?variant=45215368347838',
    priceApprox: 70,
    category: 'ropa',
    status: 'available',
    imageUrl:
      'https://cdn.shopify.com/s/files/1/0567/0699/0270/files/168055-1_zVCSaP2fqC.png?v=1752435299',
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
  if (gift.imageUrl) {
    const imageRes = await fetch(gift.imageUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to download image (${imageRes.status}): ${gift.imageUrl}`);
    }
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const imageFilename = gift.imageUrl.split('/').pop()?.split('?')[0] ?? 'gift.jpg';

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
