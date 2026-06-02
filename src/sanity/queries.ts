import type { ImageAsset, Slug } from 'sanity';

export type GiftCategory =
  | 'ropa'
  | 'juguetes'
  | 'libros'
  | 'mobiliario'
  | 'higiene'
  | 'alimentacion'
  | 'otros';

export type GiftStatus = 'available' | 'purchased' | 'hidden';

export interface Gift {
  _id: string;
  title: string;
  slug: Slug;
  description?: string;
  image?: { asset: ImageAsset; hotspot?: unknown; crop?: unknown };
  externalUrl: string;
  priceApprox?: number;
  category?: GiftCategory;
  notes?: string;
  status: GiftStatus;
}

export const availableGiftsQuery = `
  *[_type == "gift" && status == "available"]
    | order(orderRank asc, _createdAt asc) {
      _id, title, slug, description, image, externalUrl,
      priceApprox, category, notes, status
    }
`;

export const giftSlugsQuery = `
  *[_type == "gift" && status == "available" && defined(slug.current)][].slug.current
`;

export const giftBySlugQuery = `
  *[_type == "gift" && slug.current == $slug][0] {
    _id, title, slug, description, image, externalUrl,
    priceApprox, category, notes, status
  }
`;

export interface ReservationDoc {
  _id: string;
  giftId: string;
  name?: string;
}

export const reservationsQuery = `
  *[_type == "reservation"]{ _id, giftId, name }
`;
