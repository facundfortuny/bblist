import { sanity, json, type Env } from './_sanity';

// POST /api/release — undo a reservation. The browser sends the id it stored
// when it reserved the gift.
export const onRequestPost = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) => {
  try {
    const body = (await request.json()) as { id?: string };
    const id = (body.id || '').trim();
    if (!id) return json({ error: 'missing id' }, 400);

    await sanity(env).delete(id);
    return json({ ok: true });
  } catch {
    return json({ error: 'server' }, 500);
  }
};
