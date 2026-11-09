import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

async function readProjects() {
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

async function writeRegistry(projects) {
    const registryHeader = `/**\n * Generated from project.json manifests inside assets by scripts/build-site.mjs.\n * Add or edit project folders, then run npm run projects:sync.\n */\n`;
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

const projects = await readProjects();
await writeRegistry(projects);

if (!process.argv.includes('--sync-only')) {
    await buildStaticSite();
}

console.log(`${projects.length} projects registered${process.argv.includes('--sync-only') ? '.' : ' and copied to dist/.'}`);
