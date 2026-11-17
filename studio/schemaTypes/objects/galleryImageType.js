import { defineField, defineType } from 'sanity';

export const galleryImageType = defineType({
    name: 'galleryImage',
    title: 'Gallery image',
    type: 'object',
    fields: [
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: { hotspot: true },
            validation: rule => rule.required()
        }),
        defineField({
            name: 'alt',
            title: 'Alternative text',
            type: 'string',
            description: 'Describe the room or detail for visitors using a screen reader.',
            validation: rule => rule.required().max(160)
        }),
        defineField({
            name: 'caption',
            title: 'Caption',
            type: 'string',
            validation: rule => rule.max(160)
        })
    ],
    preview: {
        select: { title: 'alt', subtitle: 'caption', media: 'image' }
    }
});
