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
    title: 'Sac cobrepeus mitja estació Praliné rayas matcha TOG 2,5',
    description:
      "Folre per a la cadira amb cobrepeus integrat de la col·lecció Praliné, estampat vichy/ratlles matcha. Encoixinat extraïble i teixit antitranspirant per evitar la suor. Adaptable a la majoria de cotxets i rentable a 30°C.",
    externalUrl:
      'https://walkingmum.com/en/product/footmuff-midseason-praline-vichy-strips-matcha-tog-25/',
    priceApprox: 100,
    category: 'ropa',
    status: 'available',
    imageUrl: 'https://walkingmum.com/wp-content/uploads/2026/02/1120800699_a.jpg',
  },
  {
    title: 'Funda per a cadireta de cotxe Praliné rayas matcha',
    description:
      "Funda universal per a la cadireta de cotxe (grup 0/0+ i grup 1) de la col·lecció Praliné rayas matcha. Teixit de cotó transpirable que redueix la suor i millora el confort als trajectes. Rentable a 30°C.",
    externalUrl:
      'https://walkingmum.com/en/product/auto-seat-liner-praline-strips-matcha/',
    priceApprox: 25,
    category: 'otros',
    status: 'available',
    imageUrl: 'https://walkingmum.com/wp-content/uploads/2026/02/1120800788_a.jpg',
  },
  {
    title: 'Set per jugar de panxa avall Taft Toys',
    description:
      "Set per jugar de panxa avall (tummy time) de Taft Toys. Inclou mirall, sonalls i elements sensorials de colors per estimular el bebè mentre reforça el coll i les espatlles.",
    externalUrl:
      'https://www.vertbaudet.es/set-para-jugar-boca-abajo-para-bebe-taft-toys-multicolor.htm?ProductId=341016755&FiltreCouleur=0201',
    priceApprox: 30,
    category: 'juguetes',
    status: 'available',
    // Vertbaudet blocks image hotlinking/scraping — no image; the UI falls back
    // to the category illustration. Add an imageUrl here later if you have one.
    imageUrl: null,
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
