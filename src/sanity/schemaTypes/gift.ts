import { defineType, defineField } from 'sanity';

export const gift = defineType({
  name: 'gift',
  title: 'Regalo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required().min(1).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'externalUrl',
      title: 'Enlace de compra',
      type: 'url',
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ['https'], allowRelative: false }),
    }),
    defineField({
      name: 'priceApprox',
      title: 'Precio aproximado (€)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          { title: 'Ropa', value: 'ropa' },
          { title: 'Juguetes', value: 'juguetes' },
          { title: 'Libros', value: 'libros' },
          { title: 'Mobiliario', value: 'mobiliario' },
          { title: 'Higiene', value: 'higiene' },
          { title: 'Alimentación', value: 'alimentacion' },
          { title: 'Otros', value: 'otros' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'notes',
      title: 'Notas',
      description: 'Talla, color, preferencias…',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Disponible', value: 'available' },
          { title: 'Comprado', value: 'purchased' },
          { title: 'Oculto', value: 'hidden' },
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image', subtitle: 'status' },
  },
});
