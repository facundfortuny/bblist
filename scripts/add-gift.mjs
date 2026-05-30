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
    title: "Arc d'activitats de fusta FSC",
    description:
      "Arc d'activitats de fusta certificada FSC amb base color sàlvia i tres joguines d'estimulació per sorprendre el bebè. Es pot col·locar al parc o sobre una estora d'estimulació.",
    externalUrl:
      'https://www.vertbaudet.es/arco-de-actividades-de-madera-fsc-tanzania.htm?ProductId=620033342&FiltreCouleur=6730',
    priceApprox: 45,
    category: 'juguetes',
    status: 'available',
    imageUrl:
      'https://media.vertbaudet.es/Pictures/vertbaudet/208640/arco-de-actividades-de-madera-fsc.jpg',
  },
  {
    title: 'Biberó MAM Cristal Feel Good flux extra lent 90 ml',
    description:
      "Biberó de vidre de borosilicat resistent a altes temperatures, apte per a rentaplats i microones. Tetina SkinSoft de silicona amb un 94% d'acceptació, imita la pell materna. Flux extra lent ideal per combinar amb la lactància materna. Lliure de BPA i BPS.",
    externalUrl:
      'https://www.atida.com/es-es/mam-biberon-cristal-feel-good-flujo-extra-lento-neutro-brillante-0m-90-ml',
    priceApprox: 10,
    category: 'alimentacion',
    status: 'available',
    imageUrl:
      'https://assets.atida.com/transform/aa00456f-55f5-4ec0-9fd5-16e3a30eab99/MAM-Biberon-Cristal-Feel-Good-Flujo-Extra-Lento-Neutro-Brillante-0m-90-ml?io=transform:extend,width:800,height:800',
  },
  {
    title: 'Weleda Set de regal Benvingut Bebè 2025',
    description:
      "Set de cura per al bebè amb ingredients 100% naturals i calèndula com a ingredient estrella. Inclou una rutina completa de cura recomanada per experts, amb protecció des del primer dia.",
    externalUrl:
      'https://www.atida.com/es-es/weleda-set-de-regalo-bienvenido-bebe-2025',
    priceApprox: 34,
    category: 'higiene',
    status: 'available',
    imageUrl:
      'https://assets.atida.com/transform/a0cc902c-47fe-415f-b2b4-66133621ac4c/Weleda-Set-de-Regalo-Bienvenido-Bebe-2025?io=transform:extend,width:800,height:800',
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
