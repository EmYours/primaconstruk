# Prima Construk CMS

Sanity Studio manages portfolio content. The public website reads published projects during `npm run build` and writes the same `assets/projects-data.js` registry used by the existing archive, filters, and project dialogs.

The first CMS integration covers projects. The Studio also defines team, homepage, and website-settings forms for the next integration phase. Those three document types do not change the public website yet.

## Content flow

```text
Sanity Studio -> published dataset -> Vercel build -> dist/ -> live website
```

If the build has no `SANITY_PROJECT_ID`, it reads project folders from `assets/`. If a configured CMS request fails, the build uses those folders unless `SANITY_STRICT=true`.

## Prerequisites

- A Sanity project and project ID
- A `production` dataset, or another dataset name you control
- Access to the Prima Construk Vercel project

Do not commit `.env`, API tokens, or the Vercel Deploy Hook URL.

## Local setup

1. Copy `.env.example` to `.env` and set `SANITY_PROJECT_ID`.
2. Copy `studio/.env.example` to `studio/.env` and set the same project ID.
3. Install dependencies:

   ```powershell
   npm install
   npm --prefix studio install
   ```

4. Start the editor:

   ```powershell
   npm run cms:dev
   ```

5. Build the public site from published CMS content:

   ```powershell
   npm run build
   ```

The build output states whether it used `Sanity CMS`, `local project folders`, or `local fallback`.

## Project publishing requirements

Each visible project needs:

- Title and URL slug
- Location, year or timeline, and category
- Preview summary and case-study introduction
- Cover image
- Display order

Before and after images, project facts, and gallery images remain optional. Gallery images require alternative text. Enable **Hide from website** to keep a published entry out of the archive.

## Vercel configuration

Add these variables to the Production and Preview environments:

```text
SANITY_PROJECT_ID=<project ID>
SANITY_DATASET=production
SANITY_API_VERSION=2026-11-17
SANITY_READ_TOKEN=
SANITY_STRICT=true
```

Leave `SANITY_READ_TOKEN` empty for a public dataset. A private dataset needs a read token stored in Vercel, never in the repository.

Start with `SANITY_STRICT=false` while importing the first projects. Change it to `true` after Sanity contains at least one published project with a cover image. Strict mode makes Vercel stop a deployment when the CMS request fails. Local development defaults to the folder fallback.

## Automatic publishing

1. Open the Vercel project settings.
2. Create a Deploy Hook for the `main` branch.
3. In Sanity project settings, create a document webhook that calls the Deploy Hook.
4. Filter the webhook to project publish, update, and delete events.
5. Publish a test project and confirm that Vercel starts a deployment.

Treat the Deploy Hook URL as a secret. Anyone who has it can trigger a deployment.

## Studio deployment

Deploy the content editor after both Studio environment variables are set:

```powershell
npm run cms:deploy
```

Sanity will provide the editor URL. Add the company editors through the Sanity project management screen.

## Validation

Run both builds before pushing schema or loader changes:

```powershell
npm run build
$env:SANITY_STUDIO_PROJECT_ID='<project ID>'
$env:SANITY_STUDIO_DATASET='production'
npm run cms:build
```

The public build must continue to work without CMS variables so the local project folders remain a usable rollback source.
