const siteHeader = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const heroStage = document.querySelector('.hero-stage');
const hero = document.getElementById('hero');
const heroCopy = document.getElementById('heroCopy');
const scrollProgress = document.getElementById('scrollProgress');
const parallaxImages = document.querySelectorAll('.material-wide img, .material-tall img, .studio-visual img');
const projectDialog = document.getElementById('projectDialog');
const dialogContent = document.getElementById('dialogContent');
const dialogClose = document.getElementById('dialogClose');

const escapeHTML = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

function updateHeader() {
    siteHeader?.classList.toggle('scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionFrame = 0;

const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));

function updateScrollMotion() {
    motionFrame = 0;

    if (scrollProgress) {
        const scrollablePage = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        scrollProgress.style.transform = `scaleY(${clamp(window.scrollY / scrollablePage)})`;
    }

    if (!heroStage || !hero || !heroCopy) return;

    const motionEnabled = window.innerWidth > 820 && !reducedMotionQuery.matches;

    parallaxImages.forEach(image => {
        if (!motionEnabled) {
            image.style.setProperty('--parallax-y', '0px');
            return;
        }

        const bounds = image.parentElement.getBoundingClientRect();
        const viewportOffset = (bounds.top + (bounds.height / 2) - (window.innerHeight / 2)) / window.innerHeight;
        image.style.setProperty('--parallax-y', `${clamp(viewportOffset, -1, 1) * -18}px`);
    });

    if (!motionEnabled) {
        hero.style.setProperty('--hero-shift', '0px');
        hero.style.setProperty('--hero-translate', '0px');
        hero.style.setProperty('--hero-copy-opacity', '1');
        hero.style.setProperty('--hero-copy-y', '0px');
        hero.style.setProperty('--hero-brand-opacity', '0');
        hero.style.setProperty('--hero-brand-y', '1.5rem');
        hero.style.setProperty('--hero-shade', '0');
        return;
    }

    const stageBounds = heroStage.getBoundingClientRect();
    const scrollDistance = Math.max(1, heroStage.offsetHeight - window.innerHeight);
    const progress = clamp(-stageBounds.top / scrollDistance);
    const easedProgress = progress * progress * (3 - (2 * progress));
    const copyWidth = heroCopy.getBoundingClientRect().width;
    const brandProgress = clamp((progress - .5) / .36);

    hero.style.setProperty('--hero-shift', `${easedProgress * copyWidth}px`);
    hero.style.setProperty('--hero-translate', `${easedProgress * copyWidth * -1}px`);
    hero.style.setProperty('--hero-copy-opacity', String(clamp(1 - (progress * 1.75))));
    hero.style.setProperty('--hero-copy-y', `${progress * -28}px`);
    hero.style.setProperty('--hero-brand-opacity', String(brandProgress));
    hero.style.setProperty('--hero-brand-y', `${(1 - brandProgress) * 24}px`);
    hero.style.setProperty('--hero-shade', String(brandProgress * .22));
}

function requestMotionUpdate() {
    if (motionFrame) return;
    motionFrame = window.requestAnimationFrame(updateScrollMotion);
}

updateScrollMotion();
window.addEventListener('scroll', requestMotionUpdate, { passive: true });
window.addEventListener('resize', requestMotionUpdate, { passive: true });
reducedMotionQuery.addEventListener?.('change', requestMotionUpdate);

function closeMenu() {
    menuToggle?.setAttribute('aria-expanded', 'false');
    const label = menuToggle?.querySelector('.sr-only');
    if (label) label.textContent = 'Open menu';
    mobileNav?.classList.remove('open');
    document.body.classList.remove('menu-open');
}

menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    const label = menuToggle.querySelector('.sr-only');
    if (label) label.textContent = isOpen ? 'Open menu' : 'Close menu';
    mobileNav?.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
});

mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -7% 0px'
});

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

function projectWithPaths(project) {
    const base = `assets/${project.id}/`;
    const imagePath = path => path ? `${base}${path}` : '';

    return {
        ...project,
        coverImage: imagePath(project.coverImage),
        beforeImage: imagePath(project.beforeImage),
        afterImage: imagePath(project.afterImage),
        gallery: (project.gallery || []).map(imagePath)
    };
}

function buildProjectDialog(project) {
    const data = projectWithPaths(project);
    const facts = (data.highlights || []).map(item => `
        <div class="dialog-fact">
            <span>${escapeHTML(item.label)}</span>
            <span>${escapeHTML(item.value)}</span>
        </div>
    `).join('');

    const gallery = data.gallery.map((src, index) => `
        <figure>
            <img src="${escapeHTML(src)}" alt="${escapeHTML(data.title)} project view ${index + 1}" loading="lazy">
        </figure>
    `).join('');

    return `
        <article>
            <div class="dialog-hero">
                <div class="dialog-heading">
                    <p class="eyebrow">${escapeHTML(data.location)} · ${escapeHTML(data.year)}</p>
                    <h2 id="dialogTitle">${escapeHTML(data.title)}</h2>
                    <p>${escapeHTML(data.summary)}</p>
                </div>
                <figure class="dialog-cover">
                    <img src="${escapeHTML(data.coverImage)}" alt="${escapeHTML(data.title)}">
                </figure>
            </div>
            <div class="dialog-details">
                <p class="dialog-description">${escapeHTML(data.description)}</p>
                <div class="dialog-facts">
                    <div class="dialog-fact"><span>Location</span><span>${escapeHTML(data.location)}</span></div>
                    <div class="dialog-fact"><span>Completed</span><span>${escapeHTML(data.year)}</span></div>
                    ${facts}
                </div>
            </div>
            <div class="dialog-gallery">${gallery}</div>
            <div class="dialog-cta">
                <p>Have a space in mind?</p>
                <a class="text-link" href="#inquire" data-dialog-inquire>Start a conversation <span aria-hidden="true">↗</span></a>
            </div>
        </article>
    `;
}

function openProject(projectId) {
    const rawProjects = window.PRIMA_PROJECTS || [];
    const project = rawProjects.find(item => item.id === projectId);
    if (!project || !projectDialog || !dialogContent) return;

    dialogContent.innerHTML = buildProjectDialog(project);
    projectDialog.showModal();
    document.body.classList.add('dialog-open');
    requestAnimationFrame(() => projectDialog.scrollTo(0, 0));

    dialogContent.querySelector('[data-dialog-inquire]')?.addEventListener('click', () => {
        projectDialog.close();
    });
}

document.querySelectorAll('.project-open').forEach(button => {
    button.addEventListener('click', () => openProject(button.dataset.projectId));
});

dialogClose?.addEventListener('click', () => projectDialog?.close());

projectDialog?.addEventListener('click', event => {
    if (event.target === projectDialog) projectDialog.close();
});

projectDialog?.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
});

document.getElementById('year').textContent = new Date().getFullYear();
