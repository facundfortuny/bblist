import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { schemaTypes } from './src/sanity/schemaTypes';

const projectId = import.meta.env.SANITY_STUDIO_PROJECT_ID;
const dataset = import.meta.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineConfig({
  name: 'default',
  title: 'bblist',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Contingut')
          .items([
            // Drag-and-drop orderable list of gifts.
            orderableDocumentListDeskItem({
              type: 'gift',
              title: 'Regals',
              S,
              context,
            }),
            S.documentTypeListItem('reservation').title('Reserves'),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
