import { defineType, defineField } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';

export const gift = defineType({
  name: 'gift',
  title: 'Regal',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    // Manual drag-and-drop order (managed from the orderable list in Studio).
    orderRankField({ type: 'gift' }),
    defineField({
      name: 'title',
      title: 'Títol',
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
      title: 'Descripció',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Imatge',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'externalUrl',
      title: 'Enllaç de compra',
      type: 'url',
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ['https'], allowRelative: false }),
    }),
    defineField({
      name: 'priceApprox',
      title: 'Preu aproximat (€)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          { title: 'Roba', value: 'ropa' },
          { title: 'Joguines', value: 'juguetes' },
          { title: 'Llibres', value: 'libros' },
          { title: 'Mobiliari', value: 'mobiliario' },
          { title: 'Higiene', value: 'higiene' },
          { title: 'Alimentació', value: 'alimentacion' },
          { title: 'Altres', value: 'otros' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      description: 'Talla, color, preferències…',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'status',
      title: 'Estat',
      type: 'string',
      options: {
        list: [
          { title: 'Disponible', value: 'available' },
          { title: 'Comprat', value: 'purchased' },
          { title: 'Ocult', value: 'hidden' },
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
