import 'dotenv/config';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const assetsDirectory = path.join(projectRoot, 'assets');
const outputDirectory = path.join(projectRoot, 'dist');
const imageExtensions = new Set(['.avif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);

const numericCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function isImage(fileName) {
    return imageExtensions.has(path.extname(fileName).toLowerCase());
}

function existingImage(fileName, imageFiles) {
    return fileName && imageFiles.includes(fileName) ? fileName : '';
}

function imageNamed(stem, imageFiles) {
    return imageFiles.find(fileName => path.parse(fileName).name.toLowerCase() === stem) || '';
}

function unique(values) {
    return [...new Set(values.filter(Boolean))];
}

function uniqueGalleryItems(items) {
    const seen = new Set();

    return items.filter(item => {
        if (!item?.src || seen.has(item.src)) return false;
        seen.add(item.src);
        return true;
    });
}

async function readLocalProjects() {
    const assetEntries = await readdir(assetsDirectory, { withFileTypes: true });
    const projectDirectories = assetEntries
        .filter(entry => entry.isDirectory())
        .sort((a, b) => numericCollator.compare(a.name, b.name));
    const projects = [];

    for (const directory of projectDirectories) {
        const projectDirectory = path.join(assetsDirectory, directory.name);
        const manifestPath = path.join(projectDirectory, 'project.json');
        let manifest;

        try {
            manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
        } catch (error) {
            if (error.code === 'ENOENT') continue;
            throw new Error(`Could not read ${path.relative(projectRoot, manifestPath)}: ${error.message}`);
        }

        const imageFiles = (await readdir(projectDirectory))
            .filter(isImage)
            .sort(numericCollator.compare);
        const detailImages = imageFiles.filter(fileName => /^detail\d+/i.test(path.parse(fileName).name));
        const coverImage = existingImage(manifest.coverImage, imageFiles)
            || imageNamed('cover', imageFiles)
            || detailImages[0]
            || imageFiles[0];

        if (!coverImage) {
            throw new Error(`${directory.name}/project.json needs a cover image.`);
        }

        const beforeImage = existingImage(manifest.beforeImage, imageFiles) || imageNamed('before', imageFiles);
        const afterImage = existingImage(manifest.afterImage, imageFiles) || imageNamed('after', imageFiles);
        const requestedGallery = Array.isArray(manifest.gallery)
            ? manifest.gallery.map(fileName => existingImage(fileName, imageFiles)).filter(Boolean)
            : [];
        const gallery = requestedGallery.length
            ? unique(requestedGallery)
            : unique([coverImage, beforeImage, afterImage, ...detailImages]);

        projects.push({
            ...manifest,
            id: directory.name,
            category: manifest.category || 'Residential',
            order: Number.isFinite(Number(manifest.order)) ? Number(manifest.order) : 999,
            placeholder: Boolean(manifest.placeholder),
            coverImage,
            beforeImage,
            afterImage,
            gallery
        });
    }

    return projects.sort((a, b) => a.order - b.order || numericCollator.compare(a.title, b.title));
}

function cmsImage(image) {
    if (!image?.url) return '';

    return image.url;
}

async function readCmsProjects() {
    const projectId = process.env.SANITY_PROJECT_ID?.trim();
    if (!projectId) return null;

    const client = createClient({
        projectId,
        dataset: process.env.SANITY_DATASET?.trim() || 'production',
        apiVersion: process.env.SANITY_API_VERSION?.trim() || '2026-11-17',
        token: process.env.SANITY_READ_TOKEN?.trim() || undefined,
        useCdn: false,
        perspective: 'published'
    });

    const query = `
        *[_type == "project" && defined(slug.current) && coalesce(hidden, false) == false]
        | order(coalesce(order, 999) asc, title asc) {
            "id": slug.current,
            title,
            location,
            year,
            category,
            order,
            placeholder,
            summary,
            description,
            highlights[]{label, value},
            "coverImage": coverImage.asset->{url},
            "beforeImage": beforeImage.asset->{url},
            "afterImage": afterImage.asset->{url},
            "gallery": gallery[]{
                "url": image.asset->url,
                alt,
                caption
            }
        }
    `;
    const records = await client.fetch(query);

    return records.map((project, index) => {
        const coverImage = cmsImage(project.coverImage);
        const beforeImage = cmsImage(project.beforeImage);
        const afterImage = cmsImage(project.afterImage);

        return {
            ...project,
            id: project.id,
            category: project.category || 'Residential',
            order: Number.isFinite(Number(project.order)) ? Number(project.order) : index + 1,
            placeholder: Boolean(project.placeholder),
            coverImage,
            beforeImage,
            afterImage,
            gallery: uniqueGalleryItems([
                { src: coverImage, alt: `${project.title} cover` },
                { src: beforeImage, alt: `${project.title} before renovation` },
                { src: afterImage, alt: `${project.title} after renovation` },
                ...(project.gallery || []).map(item => ({
                    src: cmsImage(item),
                    alt: item.alt || '',
                    caption: item.caption || ''
                }))
            ])
        };
    }).filter(project => project.coverImage);
}

async function readProjects() {
    if (!process.env.SANITY_PROJECT_ID?.trim()) {
        return { projects: await readLocalProjects(), source: 'local project folders' };
    }

    try {
        const projects = await readCmsProjects();
        if (!projects.length) {
            throw new Error('The CMS returned no published projects with cover images.');
        }

        return { projects, source: 'Sanity CMS' };
    } catch (error) {
        if (process.env.SANITY_STRICT === 'true') throw error;
        console.warn(`Sanity CMS unavailable: ${error.message}`);
        console.warn('Falling back to local project folders. Set SANITY_STRICT=true to fail the build instead.');
        return { projects: await readLocalProjects(), source: 'local fallback' };
    }
}

async function writeRegistry(projects) {
    const registryHeader = `/**\n * Generated by scripts/build-site.mjs from Sanity CMS or local project folders.\n * Do not edit this file by hand.\n */\n`;
    await writeFile(
        path.join(assetsDirectory, 'projects-data.js'),
        `${registryHeader}window.PRIMA_PROJECTS = ${JSON.stringify(projects, null, 4)};\n`,
        'utf8'
    );
    await writeFile(
        path.join(assetsDirectory, 'projects.json'),
        `${JSON.stringify(projects.map(project => project.id), null, 4)}\n`,
        'utf8'
    );
}

async function buildStaticSite() {
    if (path.dirname(outputDirectory) !== projectRoot || path.basename(outputDirectory) !== 'dist') {
        throw new Error('Refusing to clean an unexpected output directory.');
    }

    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputDirectory, { recursive: true });
    await Promise.all([
        cp(path.join(projectRoot, 'index.html'), path.join(outputDirectory, 'index.html')),
        cp(path.join(projectRoot, 'index.css'), path.join(outputDirectory, 'index.css')),
        cp(path.join(projectRoot, 'index.js'), path.join(outputDirectory, 'index.js')),
        cp(assetsDirectory, path.join(outputDirectory, 'assets'), { recursive: true })
    ]);
}

const { projects, source } = await readProjects();
await writeRegistry(projects);

if (!process.argv.includes('--sync-only')) {
    await buildStaticSite();
}

console.log(`${projects.length} projects registered from ${source}${process.argv.includes('--sync-only') ? '.' : ' and copied to dist/.'}`);
