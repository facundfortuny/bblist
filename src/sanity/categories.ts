/* Shared category metadata — Núvol pastel accent + ink + illustration key.
   Used by the home registry island and the gift detail page so the colours
   and labels can't drift between them. */

export type ArtKey = 'body' | 'toy' | 'book' | 'crib' | 'bath' | 'bottle' | 'star';

export interface Category {
  label: string;
  accent: string;
  ink: string;
  art: ArtKey;
}

export const CATEGORIES: Record<string, Category> = {
  ropa: { label: 'Roba', accent: '#F2C14E', ink: '#7C5A11', art: 'body' },
  juguetes: { label: 'Joguines', accent: '#9DC074', ink: '#41591F', art: 'toy' },
  libros: { label: 'Llibres', accent: '#EF9F73', ink: '#8A4824', art: 'book' },
  mobiliario: { label: 'Mobiliari', accent: '#8DB7DA', ink: '#2C5070', art: 'crib' },
  higiene: { label: 'Higiene', accent: '#93D2BD', ink: '#1E5C4A', art: 'bath' },
  alimentacion: { label: 'Alimentació', accent: '#EF8F97', ink: '#8A2F39', art: 'bottle' },
  otros: { label: 'Altres', accent: '#BD9EE0', ink: '#4E3380', art: 'star' },
};

export const CATEGORY_ORDER = [
  'ropa', 'juguetes', 'libros', 'mobiliario', 'higiene', 'alimentacion', 'otros',
];

export const catFor = (id: string | undefined): Category =>
  (id && CATEGORIES[id]) || CATEGORIES.otros;
