# Adding a project

Create one folder inside `assets/`. The folder name becomes the project ID used by the website.

```text
assets/
└── project-name/
    ├── project.json
    ├── cover.jpg
    ├── before.jpg       optional
    ├── after.jpg        optional
    ├── detail1.jpg      optional
    ├── detail2.jpg
    └── detail3.jpg
```

Use JPG, JPEG, PNG, WebP, AVIF, or SVG images. The build finds `cover`, `before`, `after`, and numbered `detail` files regardless of the image extension.

## `project.json`

```json
{
    "title": "Project Name",
    "location": "Quezon City, Metro Manila",
    "year": "2027",
    "category": "Residential",
    "order": 11,
    "summary": "One sentence used in the project preview.",
    "description": "The longer case-study introduction.",
    "highlights": [
        { "label": "Scope", "value": "Design and Build" },
        { "label": "Status", "value": "Completed" }
    ]
}
```

Supported categories are `Residential`, `Commercial`, `Hospitality`, and `In Progress`. `order` controls the position in the archive.

You may set `coverImage`, `beforeImage`, `afterImage`, or `gallery` in the JSON when a project uses custom filenames. If you omit them, the build uses the standard filenames and gathers `detail1`, `detail2`, and later numbered images in order.

## Publish it

Commit the folder and push it to GitHub. Vercel runs `npm run build`, scans every folder containing `project.json`, and rebuilds the project registry. You do not need to edit `index.html`, `index.js`, or `assets/projects-data.js`.

Run this command when you want to refresh the registry locally:

```powershell
npm run projects:sync
```

The build stops when a project has no usable cover image or contains invalid JSON. Fix the named folder and run the command again.
