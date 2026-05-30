import { sanity, json, type Env } from './_sanity';

// POST /api/guess — a guest proposes a name. Stored as a `nameGuess` document
// you read in Sanity Studio.
export const onRequestPost = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) => {
  try {
    const body = (await request.json()) as { guess?: string; from?: string };
    const guess = (body.guess || '').trim().slice(0, 40);
    if (!guess) return json({ error: 'empty' }, 400);

    await sanity(env).create({
      _type: 'nameGuess',
      guess,
      from: (body.from || '').trim().slice(0, 40) || undefined,
      createdAt: new Date().toISOString(),
    });
    return json({ ok: true });
  } catch {
    return json({ error: 'server' }, 500);
  }
};
