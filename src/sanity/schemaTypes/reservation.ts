import { defineType, defineField } from 'sanity';

export const reservation = defineType({
  name: 'reservation',
  title: 'Reserva de regal',
  type: 'document',
  // One document per "L'agafo jo". A gift is shown as taken while a reservation
  // for its id exists; releasing deletes the document.
  fields: [
    defineField({
      name: 'giftId',
      title: 'ID del regal',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'giftTitle',
      title: 'Regal',
      type: 'string',
    }),
    defineField({
      name: 'name',
      title: 'Reservat per',
      type: 'string',
    }),
    defineField({
      name: 'createdAt',
      title: 'Data',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Més recents primer',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'giftTitle', subtitle: 'name' },
  },
});
