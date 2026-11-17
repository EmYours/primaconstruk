const singleton = (S, type, title) => S.listItem()
    .title(title)
    .id(type)
    .child(S.document().schemaType(type).documentId(type).title(title));

export const structure = S => S.list()
    .title('Prima Construk')
    .items([
        S.documentTypeListItem('project').title('Projects'),
        S.documentTypeListItem('teamMember').title('Team'),
        S.divider(),
        singleton(S, 'homepage', 'Homepage'),
        singleton(S, 'siteSettings', 'Website settings')
    ]);
