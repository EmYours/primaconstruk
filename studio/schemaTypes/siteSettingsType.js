import { defineField, defineType } from 'sanity';

export const siteSettingsType = defineType({
    name: 'siteSettings',
    title: 'Website settings',
    type: 'document',
    fields: [
        defineField({ name: 'email', title: 'Email', type: 'email' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string', validation: rule => rule.max(30) }),
        defineField({ name: 'location', title: 'Location', type: 'string', validation: rule => rule.max(100) }),
        defineField({ name: 'facebookUrl', title: 'Facebook URL', type: 'url' }),
        defineField({ name: 'instagramUrl', title: 'Instagram URL', type: 'url' }),
        defineField({ name: 'messengerUrl', title: 'Messenger URL', type: 'url' }),
        defineField({ name: 'footerTagline', title: 'Footer tagline', type: 'string', validation: rule => rule.max(100) })
    ],
    preview: {
        prepare: () => ({ title: 'Website settings' })
    }
});
