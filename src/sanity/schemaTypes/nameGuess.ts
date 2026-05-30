import { defineType, defineField } from 'sanity';

export const nameGuess = defineType({
  name: 'nameGuess',
  title: 'Proposta de nom',
  type: 'document',
  // Guests create these from the site; you read them here in Studio.
  fields: [
    defineField({
      name: 'guess',
      title: 'Nom proposat',
      type: 'string',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'from',
      title: 'De part de',
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
    select: { title: 'guess', subtitle: 'from' },
  },
});
