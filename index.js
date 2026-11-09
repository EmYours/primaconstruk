const siteHeader = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const socialFloat = document.querySelector('.social-float');
const heroStage = document.querySelector('.hero-stage');
const hero = document.getElementById('hero');
const heroCopy = document.getElementById('heroCopy');
const scrollProgress = document.getElementById('scrollProgress');
const parallaxImages = document.querySelectorAll('.project-image img, .material-wide img, .material-tall img');
const revealElements = [...document.querySelectorAll('.reveal')];
const roomAssembly = document.getElementById('roomAssembly');
const roomScene = document.getElementById('roomScene');
const roomAssemblyCopy = document.getElementById('roomAssemblyCopy');
const roomAssemblyLabel = document.getElementById('roomAssemblyLabel');
const roomAssemblyProgress = document.getElementById('roomAssemblyProgress');
const roomSofaLayer = document.getElementById('roomSofaLayer');
const roomDiningLayer = document.getElementById('roomDiningLayer');
const roomFinalLayer = document.getElementById('roomFinalLayer');
const comparison = document.getElementById('comparison');
const comparisonRange = document.getElementById('comparisonRange');
const beforeImage = document.getElementById('beforeImage');
const afterWrap = document.getElementById('afterWrap');
const afterImage = document.getElementById('afterImage');
const comparisonLine = document.getElementById('comparisonLine');
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
    socialFloat?.classList.toggle('compact', window.scrollY > window.innerHeight * .65);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionFrame = 0;

const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
const smoothStep = value => {
    const progress = clamp(value);
    return progress * progress * (3 - (2 * progress));
};

function setAssemblyLayer(element, progress, startX, startY, startScale = .96) {
    if (!element) return;
    element.style.opacity = String(progress);
    element.style.transform = `translate3d(${(1 - progress) * startX}vw, ${(1 - progress) * startY}vh, 0) scale(${startScale + ((1 - startScale) * progress)})`;
}

function updateRoomAssembly() {
    if (!roomAssembly || !roomScene) return;

    if (reducedMotionQuery.matches) {
        [roomSofaLayer, roomDiningLayer]
            .forEach(layer => {
                if (layer) layer.style.opacity = '0';
            });
        if (roomFinalLayer) roomFinalLayer.style.opacity = '1';
        if (roomAssemblyCopy) {
            roomAssemblyCopy.style.opacity = '1';
            roomAssemblyCopy.style.transform = 'none';
        }
        if (roomAssemblyProgress) roomAssemblyProgress.style.transform = 'scaleX(1)';
        if (roomAssemblyLabel) roomAssemblyLabel.textContent = '04 / The complete room';
        return;
    }

    const bounds = roomAssembly.getBoundingClientRect();
    const scrollDistance = Math.max(1, roomAssembly.offsetHeight - window.innerHeight);
    const progress = clamp(-bounds.top / scrollDistance);
    const sofaProgress = smoothStep((progress - .08) / .24);
    const diningProgress = smoothStep((progress - .38) / .22);
    const finalProgress = smoothStep((progress - .72) / .18);
    const copyExit = window.innerWidth <= 820 ? 0 : smoothStep((progress - .52) / .15);

    setAssemblyLayer(roomSofaLayer, sofaProgress, -18, 8);
    setAssemblyLayer(roomDiningLayer, diningProgress, 18, 7);

    if (roomFinalLayer) roomFinalLayer.style.opacity = String(finalProgress);
    if (roomAssemblyProgress) roomAssemblyProgress.style.transform = `scaleX(${progress})`;
    if (roomAssemblyCopy) {
        roomAssemblyCopy.style.opacity = String(1 - copyExit);
        roomAssemblyCopy.style.transform = `translate3d(0, ${copyExit * -24}px, 0)`;
    }

    if (roomAssemblyLabel) {
        roomAssemblyLabel.textContent = progress < .28
            ? '01 / The shell'
            : progress < .52
                ? '02 / The living layer'
                : progress < .78
                    ? '03 / Dining and detail'
                    : '04 / The complete room';
    }
}

function updateMobileReveals() {
    if (window.innerWidth > 820 || reducedMotionQuery.matches) return;

    revealElements.forEach(element => {
        if (element.classList.contains('is-visible')) return;

        const bounds = element.getBoundingClientRect();
        const isInsideViewport = bounds.top < window.innerHeight * .94 && bounds.bottom > 0;
        if (isInsideViewport) element.classList.add('is-visible');
    });
}

function updateScrollMotion() {
    motionFrame = 0;

    if (scrollProgress) {
        const scrollablePage = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        scrollProgress.style.transform = `scaleY(${clamp(window.scrollY / scrollablePage)})`;
    }

    updateMobileReveals();
    updateRoomAssembly();

    if (!heroStage || !hero || !heroCopy) return;

    const reducedMotion = reducedMotionQuery.matches;
    const desktopMotionEnabled = window.innerWidth > 820 && !reducedMotion;

    parallaxImages.forEach(image => {
        if (reducedMotion) {
            image.style.setProperty('--parallax-y', '0px');
            return;
        }

        const bounds = image.parentElement.getBoundingClientRect();
        const viewportOffset = (bounds.top + (bounds.height / 2) - (window.innerHeight / 2)) / window.innerHeight;
        const amplitude = desktopMotionEnabled ? 18 : 8;
        image.style.setProperty('--parallax-y', `${clamp(viewportOffset, -1, 1) * -amplitude}px`);
    });

    if (!desktopMotionEnabled) {
        const mobileHeroProgress = reducedMotion
            ? 0
            : clamp(-heroStage.getBoundingClientRect().top / Math.max(1, heroStage.offsetHeight));

        hero.style.setProperty('--hero-mobile-y', `${mobileHeroProgress * -14}px`);
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

revealElements.forEach(element => revealObserver.observe(element));

let comparisonAnimationFrame = 0;
let comparisonAutoStart = 0;
let comparisonVisible = false;
let comparisonInterrupted = false;

function syncComparison() {
    if (!comparison || !comparisonRange || !beforeImage || !afterWrap || !afterImage || !comparisonLine) return;
    const value = clamp(Number(comparisonRange.value), 0, 100);

    afterWrap.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    comparisonLine.style.left = `${value}%`;
    comparisonRange.setAttribute('aria-valuetext', `${Math.round(value)}% of the finished room revealed`);
}

function animateComparison(timestamp) {
    comparisonAnimationFrame = 0;
    if (!comparisonVisible || comparisonInterrupted || reducedMotionQuery.matches || !comparisonRange) return;

    if (!comparisonAutoStart) comparisonAutoStart = timestamp;
    comparisonRange.value = String(50 + (18 * Math.sin((timestamp - comparisonAutoStart) / 900)));
    syncComparison();
    comparisonAnimationFrame = window.requestAnimationFrame(animateComparison);
}

function startComparisonAuto() {
    if (comparisonAnimationFrame || !comparisonVisible || comparisonInterrupted || reducedMotionQuery.matches) return;
    comparisonAutoStart = 0;
    comparisonAnimationFrame = window.requestAnimationFrame(animateComparison);
}

function stopComparisonAuto() {
    if (comparisonInterrupted) return;
    comparisonInterrupted = true;
    comparison?.classList.add('is-interacted');
    if (comparisonAnimationFrame) window.cancelAnimationFrame(comparisonAnimationFrame);
    comparisonAnimationFrame = 0;
}

function updateComparisonVisibility() {
    if (!comparison) return;
    const bounds = comparison.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0));
    comparisonVisible = visibleHeight >= Math.min(bounds.height * .28, window.innerHeight * .28);

    if (comparisonVisible) {
        comparison.classList.add('is-visible');
        startComparisonAuto();
        return;
    }

    if (comparisonAnimationFrame) window.cancelAnimationFrame(comparisonAnimationFrame);
    comparisonAnimationFrame = 0;
}

['pointerdown', 'touchstart', 'keydown', 'focus'].forEach(eventName => {
    comparisonRange?.addEventListener(eventName, stopComparisonAuto, { passive: eventName === 'touchstart' });
});

comparisonRange?.addEventListener('input', () => {
    stopComparisonAuto();
    syncComparison();
});

window.addEventListener('scroll', updateComparisonVisibility, { passive: true });
window.addEventListener('resize', () => {
    syncComparison();
    updateComparisonVisibility();
}, { passive: true });
window.addEventListener('load', () => {
    syncComparison();
    updateComparisonVisibility();
});
reducedMotionQuery.addEventListener?.('change', () => {
    if (reducedMotionQuery.matches && comparisonAnimationFrame) {
        window.cancelAnimationFrame(comparisonAnimationFrame);
        comparisonAnimationFrame = 0;
        return;
    }

    startComparisonAuto();
});
syncComparison();
updateComparisonVisibility();

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
