import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes/index.js';
import { structure } from './structure.js';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

if (!projectId) {
    throw new Error('Set SANITY_STUDIO_PROJECT_ID in studio/.env before starting Sanity Studio.');
}

export default defineConfig({
    name: 'prima-construk',
    title: 'Prima Construk CMS',
    projectId,
    dataset,
    plugins: [
        structureTool({ structure }),
        visionTool()
    ],
    schema: {
        types: schemaTypes,
        templates: templates => templates.filter(template => !['homepage', 'siteSettings'].includes(template.schemaType))
    }
});
