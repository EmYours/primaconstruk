import { defineArrayMember, defineField, defineType } from 'sanity';

export const homepageType = defineType({
    name: 'homepage',
    title: 'Homepage',
    type: 'document',
    fields: [
        defineField({ name: 'bookingMessage', title: 'Booking message', type: 'string', validation: rule => rule.max(80) }),
        defineField({
            name: 'featuredProjects',
            title: 'Featured projects',
            type: 'array',
            of: [defineArrayMember({ type: 'reference', to: [{ type: 'project' }] })],
            validation: rule => rule.unique().max(6)
        }),
        defineField({
            name: 'comparisonProject',
            title: 'Before and after project',
            type: 'reference',
            to: [{ type: 'project' }],
            description: 'Choose a project that contains both before and after images.'
        }),
        defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', validation: rule => rule.max(80) }),
        defineField({ name: 'heroSupportingText', title: 'Hero supporting text', type: 'text', rows: 3, validation: rule => rule.max(220) })
    ],
    preview: {
        prepare: () => ({ title: 'Homepage content' })
    }
});
