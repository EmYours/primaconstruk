import { defineField, defineType } from 'sanity';

export const highlightType = defineType({
    name: 'projectHighlight',
    title: 'Project highlight',
    type: 'object',
    fields: [
        defineField({
            name: 'label',
            title: 'Label',
            type: 'string',
            validation: rule => rule.required().max(40)
        }),
        defineField({
            name: 'value',
            title: 'Value',
            type: 'string',
            validation: rule => rule.required().max(80)
        })
    ],
    preview: {
        select: { title: 'label', subtitle: 'value' }
    }
});
