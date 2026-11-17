import { defineArrayMember, defineField, defineType } from 'sanity';

const categories = ['Residential', 'Commercial', 'Hospitality', 'In Progress'];

export const projectType = defineType({
    name: 'project',
    title: 'Project',
    type: 'document',
    groups: [
        { name: 'overview', title: 'Overview', default: true },
        { name: 'media', title: 'Images' },
        { name: 'details', title: 'Details' },
        { name: 'publishing', title: 'Publishing' }
    ],
    fields: [
        defineField({
            name: 'title',
            title: 'Project title',
            type: 'string',
            group: 'overview',
            validation: rule => rule.required().max(80)
        }),
        defineField({
            name: 'slug',
            title: 'URL slug',
            type: 'slug',
            group: 'overview',
            options: { source: 'title', maxLength: 80 },
            validation: rule => rule.required()
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
            group: 'overview',
            validation: rule => rule.required().max(100)
        }),
        defineField({
            name: 'year',
            title: 'Completion year or timeline',
            type: 'string',
            group: 'overview',
            description: 'Examples: 2026, Ongoing, or 2026–2027.',
            validation: rule => rule.required().max(20)
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            group: 'overview',
            options: { list: categories.map(value => ({ title: value, value })), layout: 'radio' },
            initialValue: 'Residential',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'summary',
            title: 'Preview summary',
            type: 'text',
            rows: 3,
            group: 'overview',
            validation: rule => rule.required().min(30).max(220)
        }),
        defineField({
            name: 'description',
            title: 'Case study introduction',
            type: 'text',
            rows: 7,
            group: 'details',
            validation: rule => rule.required().min(80).max(1200)
        }),
        defineField({
            name: 'highlights',
            title: 'Project facts',
            type: 'array',
            group: 'details',
            of: [defineArrayMember({ type: 'projectHighlight' })],
            validation: rule => rule.max(8)
        }),
        defineField({
            name: 'coverImage',
            title: 'Cover image',
            type: 'image',
            group: 'media',
            options: { hotspot: true },
            validation: rule => rule.required()
        }),
        defineField({
            name: 'beforeImage',
            title: 'Before image',
            type: 'image',
            group: 'media',
            options: { hotspot: true }
        }),
        defineField({
            name: 'afterImage',
            title: 'After image',
            type: 'image',
            group: 'media',
            options: { hotspot: true }
        }),
        defineField({
            name: 'gallery',
            title: 'Gallery',
            type: 'array',
            group: 'media',
            of: [defineArrayMember({ type: 'galleryImage' })],
            options: { layout: 'grid' }
        }),
        defineField({
            name: 'order',
            title: 'Display order',
            type: 'number',
            group: 'publishing',
            description: 'Lower numbers appear first.',
            initialValue: 999,
            validation: rule => rule.required().integer().min(1)
        }),
        defineField({
            name: 'hidden',
            title: 'Hide from website',
            type: 'boolean',
            group: 'publishing',
            initialValue: false,
            description: 'Keep the entry published in Sanity but remove it from the website.'
        }),
        defineField({
            name: 'placeholder',
            title: 'Sample project',
            type: 'boolean',
            group: 'publishing',
            initialValue: false,
            description: 'Marks the project as sample content in the archive.'
        })
    ],
    orderings: [
        { title: 'Website order', name: 'websiteOrder', by: [{ field: 'order', direction: 'asc' }] },
        { title: 'Newest year', name: 'yearDesc', by: [{ field: 'year', direction: 'desc' }] }
    ],
    preview: {
        select: { title: 'title', location: 'location', year: 'year', media: 'coverImage', hidden: 'hidden' },
        prepare({ title, location, year, media, hidden }) {
            return {
                title: hidden ? `${title} (hidden)` : title,
                subtitle: [location, year].filter(Boolean).join(' · '),
                media
            };
        }
    }
});
