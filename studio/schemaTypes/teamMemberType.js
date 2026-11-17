import { defineField, defineType } from 'sanity';

export const teamMemberType = defineType({
    name: 'teamMember',
    title: 'Team member',
    type: 'document',
    fields: [
        defineField({ name: 'name', title: 'Name', type: 'string', validation: rule => rule.required().max(80) }),
        defineField({ name: 'role', title: 'Role', type: 'string', validation: rule => rule.required().max(80) }),
        defineField({ name: 'portrait', title: 'Portrait', type: 'image', options: { hotspot: true }, validation: rule => rule.required() }),
        defineField({ name: 'bio', title: 'Biography', type: 'text', rows: 5, validation: rule => rule.max(600) }),
        defineField({ name: 'philosophy', title: 'Design philosophy', type: 'text', rows: 4, validation: rule => rule.max(400) }),
        defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 1, validation: rule => rule.required().integer().min(1) })
    ],
    orderings: [{ title: 'Website order', name: 'websiteOrder', by: [{ field: 'order', direction: 'asc' }] }],
    preview: {
        select: { title: 'name', subtitle: 'role', media: 'portrait' }
    }
});
