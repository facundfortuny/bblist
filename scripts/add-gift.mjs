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
    title: 'Soporte para bañera Stokke Flexi Bath',
    description:
      'Soporte ergonómico que posiciona al bebé a altura cómoda. Incluye patas antideslizantes, bloqueo seguro y se pliega para fácil transporte. Apto desde recién nacido hasta 10 kg.',
    externalUrl: 'https://www.stokke.com/ESP/es-es/bano/538700.html',
    priceApprox: 69,
    category: 'higiene',
    status: 'available',
    imageUrl:
      'https://www.stokke.com/dw/image/v2/AAQF_PRD/on/demandware.static/-/Sites-stokke-master-catalog/default/dwf967ec4b/images/inriverimages/mainview/Stokke%20FlexiBath%20Stand%20210426-1254_eCom.jpg',
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

  const doc = await client.create({
    _type: 'gift',
    title: gift.title,
    slug: { _type: 'slug', current: slugify(gift.title) },
    description: gift.description,
    externalUrl: gift.externalUrl,
    priceApprox: gift.priceApprox,
    category: gift.category,
    status: gift.status,
    image: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    },
  });

  console.log(`  Created ${doc._id} — slug: ${doc.slug.current}`);
}
