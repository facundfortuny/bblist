import { sanity, json, type Env } from './_sanity';

// GET /api/reservations — current shared reservation state. Read through the
// function (same-origin) so the browser never has to call Sanity cross-origin.
export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    const result = await sanity(env).fetch(
      '*[_type == "reservation"]{ _id, giftId, name }',
    );
    return json({ result });
  } catch {
    return json({ result: [] });
  }
};
