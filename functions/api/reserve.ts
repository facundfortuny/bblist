import { sanity, json, type Env } from './_sanity';

// POST /api/reserve — a guest takes a gift. Rejects with 409 if someone already
// reserved it (the shared, anti-double-buy guarantee).
export const onRequestPost = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) => {
  try {
    const body = (await request.json()) as {
      giftId?: string;
      giftTitle?: string;
      name?: string;
    };
    const giftId = (body.giftId || '').trim();
    if (!giftId) return json({ error: 'missing giftId' }, 400);

    const client = sanity(env);
    const existing = await client.fetch<string | null>(
      '*[_type == "reservation" && giftId == $giftId][0]._id',
      { giftId },
    );
    if (existing) return json({ error: 'taken' }, 409);

    const name = (body.name || '').trim().slice(0, 40);
    const doc = await client.create({
      _type: 'reservation',
      giftId,
      giftTitle: (body.giftTitle || '').slice(0, 120) || undefined,
      name: name || undefined,
      createdAt: new Date().toISOString(),
    });
    return json({ ok: true, id: doc._id, name });
  } catch {
    return json({ error: 'server' }, 500);
  }
};
