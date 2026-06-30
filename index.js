/* ==========================================================================
   PRIMA CONSTRUK — index.js
   Reads project data from window.PRIMA_PROJECTS (assets/projects-data.js).
   Works with file:// locally and on Vercel — no server needed.
   Handles portfolio rendering, project detail modal, Before/After slider,
   and the navigable gallery lightbox.
   ========================================================================== */

// ── State ──────────────────────────────────────────────────────────────────
let lightboxImages = [];   // Full-res URLs for the active project gallery
let lightboxIndex  = 0;    // Current position in lightboxImages
let lbTouchStartX  = 0;    // Touch tracking for swipe gestures

// ── Initialise on DOM ready ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    initMobileMenu();
    initScrollReveal();
    initContactForm();
    initLightbox();

    await loadPortfolio();
});

// ── Mobile Menu ────────────────────────────────────────────────────────────
function initMobileMenu() {
    const toggle  = document.getElementById('menuToggle');
    const menu    = document.getElementById('mobileMenu');
    const links   = document.querySelectorAll('.mobile-link, .mobile-btn');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.innerHTML = open
            ? '<i data-lucide="x"></i>'
            : '<i data-lucide="menu"></i>';
        lucide.createIcons();
    });

    links.forEach(link => link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.innerHTML = '<i data-lucide="menu"></i>';
        lucide.createIcons();
    }));
}

// ── Scroll Reveal ──────────────────────────────────────────────────────────
function initScrollReveal() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

// ── Contact Form ───────────────────────────────────────────────────────────
function initContactForm() {
    const form    = document.getElementById('inquiryForm');
    const message = document.getElementById('formMessage');
    if (!form || !message) return;

    // Helper to sanitize HTML tags and trim inputs
    const sanitizeInput = (val) => {
        return val
            .replace(/<[^>]*>/g, '') // Strip HTML tags
            .replace(/[&<>"'/]/g, m => { // Escape characters
                const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
                return map[m];
            })
            .trim();
    };

    form.addEventListener('submit', e => {
        e.preventDefault();
        
        const btn      = form.querySelector('.btn-submit');
        const btnText  = btn.querySelector('span');
        const original = btnText.textContent;

        // Extract and sanitize inputs
        const nameVal     = sanitizeInput(document.getElementById('clientName').value);
        const emailVal    = sanitizeInput(document.getElementById('clientEmail').value);
        const phoneVal    = sanitizeInput(document.getElementById('clientPhone').value);
        const locationVal = sanitizeInput(document.getElementById('projectLocation').value);
        const notesVal    = sanitizeInput(document.getElementById('projectNotes').value);

        message.className = 'form-message';
        message.style.display = 'none';

        // 1. Validation Checks
        if (nameVal.length < 2) {
            showError('Please enter a valid name (at least 2 characters).');
            return;
        }

        // Email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
            showError('Please enter a valid email address.');
            return;
        }

        // Phone regex (allowing optional leading +, spaces, hyphens, and digits)
        const phoneRegex = /^[\d\s\-+\(\)]{7,20}$/;
        if (!phoneRegex.test(phoneVal)) {
            showError('Please enter a valid contact number (at least 7 digits).');
            return;
        }

        if (locationVal.length < 3) {
            showError('Please enter a valid project location.');
            return;
        }

        // Process submission loader simulation
        btn.disabled = true;
        btnText.textContent = 'Sending Application…';

        // If they update the action URL in index.html to Formspree, they can do a real fetch:
        // fetch(form.action || 'https://formspree.io/f/YOUR_ID_HERE', { method: 'POST', body: new FormData(form)... })
        
        setTimeout(() => {
            btn.disabled = false;
            btnText.textContent = original;
            
            message.textContent = `Thank you, ${nameVal}. Your project registry application has been received successfully! Our design directors will reach out to you at ${emailVal} within 48 hours.`;
            message.classList.add('success');
            message.style.display = 'block';
            form.reset();
        }, 1500);
    });

    function showError(text) {
        message.textContent = text;
        message.classList.add('error');
        message.style.display = 'block';
    }
}

// ── Portfolio Loader ───────────────────────────────────────────────────────
async function loadPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    // Read from the globally-loaded projects-data.js (works with file:// and Vercel)
    const rawProjects = window.PRIMA_PROJECTS;

    if (!rawProjects || rawProjects.length === 0) {
        grid.innerHTML = `<p style="color:var(--color-text-muted);grid-column:1/-1;text-align:center;padding:40px 0;font-family:var(--font-display);letter-spacing:.1em;font-size:.85rem;">No projects found. Add entries to assets/projects-data.js to get started.</p>`;
        return;
    }

    // Prefix all image paths with assets/{id}/
    const projects = rawProjects.map(data => prefixPaths(data.id, data));

    grid.innerHTML = '';
    projects.forEach(project => {
        const card = buildProjectCard(project);
        card.addEventListener('click', () => openModal(project));
        grid.appendChild(card);
    });

    lucide.createIcons();
    initScrollReveal();
}

// Prefix all image paths in a project config with assets/{id}/
function prefixPaths(id, data) {
    const base = `assets/${id}/`;
    const prefix = src => (src ? base + src : '');

    return {
        ...data,
        id,
        coverImage  : prefix(data.coverImage),
        beforeImage : prefix(data.beforeImage),
        afterImage  : prefix(data.afterImage),
        gallery     : (data.gallery || []).map(prefix),
    };
}

// ── Project Card Builder ───────────────────────────────────────────────────
function buildProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card scroll-reveal';
    card.dataset.id = project.id;

    card.innerHTML = `
        <div class="project-card-image-box">
            <img src="${project.coverImage}" alt="${project.title}" class="project-card-img">
            <div class="project-card-overlay"></div>
        </div>
        <div class="project-card-info">
            <div class="project-card-meta">
                <span class="project-card-location">${project.location}</span>
                <span class="project-card-year">${project.year}</span>
            </div>
            <h3 class="project-card-title">${project.title}</h3>
            <p class="project-card-summary">${project.summary}</p>
            <div class="project-card-action">
                <span>View Project Details</span>
                <i data-lucide="arrow-right"></i>
            </div>
        </div>
    `;
    return card;
}

// ── Project Detail Modal ───────────────────────────────────────────────────
const projectModal  = document.getElementById('projectModal');
const modalBody     = document.getElementById('modalBody');
const modalClose    = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

if (modalClose)    modalClose.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (document.getElementById('lightboxOverlay')?.classList.contains('active')) closeLightbox();
        else closeModal();
    }
    if (document.getElementById('lightboxOverlay')?.classList.contains('active')) {
        if (e.key === 'ArrowLeft')  navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    }
});

function openModal(project) {
    if (!projectModal || !modalBody) return;

    const hasSlider = project.beforeImage && project.afterImage;

    const sliderHTML = hasSlider ? `
        <div class="slider-container" id="modalSliderContainer">
            <img src="${project.beforeImage}" alt="Before – ${project.title}" class="slider-image before-img">
            <div class="after-img-container" id="modalAfterContainer">
                <img src="${project.afterImage}" alt="After – ${project.title}" class="slider-image after-img" id="modalAfterImg">
            </div>
            <div class="slider-handle" id="modalSliderHandle">
                <div class="handle-line"></div>
                <div class="handle-button"><i data-lucide="chevrons-left-right"></i></div>
                <div class="handle-line"></div>
            </div>
            <span class="slider-label label-before">BEFORE CONSTRUCTION</span>
            <span class="slider-label label-after">AFTER STYLING</span>
        </div>
    ` : `
        <div class="no-slider-placeholder">
            <i data-lucide="image-off"></i>
            <span>Before &amp; After View Not Available</span>
        </div>
    `;

    const galleryHTML = project.gallery.map((src, i) => `
        <div class="gallery-thumb-card" data-index="${i}">
            <img src="${src}" alt="${project.title} — image ${i + 1}">
        </div>
    `).join('');

    const highlightsHTML = (project.highlights || []).map(hl => `
        <div class="modal-highlight-item">
            <span class="modal-highlight-lbl">${hl.label}</span>
            <span class="modal-highlight-val">${hl.value}</span>
        </div>
    `).join('');

    modalBody.innerHTML = `
        <div class="modal-header-section">
            <div class="modal-project-meta">
                <span>${project.location}</span>
                <span>•</span>
                <span>${project.year}</span>
            </div>
            <h2 class="modal-project-title">${project.title}</h2>
        </div>

        <div class="modal-main-grid">
            <div class="modal-visuals">
                <div class="modal-slider-box">${sliderHTML}</div>

                <div class="modal-gallery-box">
                    <h4 class="modal-gallery-title">Project Gallery</h4>
                    <div class="modal-gallery-grid">${galleryHTML}</div>
                </div>
            </div>

            <div class="modal-info-panel">
                <h4 class="modal-desc-heading">PROJECT INTENTION</h4>
                <p class="modal-project-desc">${project.description}</p>
                <div class="modal-project-highlights">${highlightsHTML}</div>
            </div>
        </div>
    `;

    lucide.createIcons();
    projectModal.classList.add('active');
    document.body.classList.add('modal-open');

    if (hasSlider) initModalSlider();

    // Set up gallery thumbnails to open lightbox for THIS project
    lightboxImages = project.gallery;
    modalBody.querySelectorAll('.gallery-thumb-card').forEach(thumb => {
        thumb.addEventListener('click', () => {
            openLightbox(parseInt(thumb.dataset.index, 10));
        });
    });
}

function closeModal() {
    projectModal?.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// ── Before & After Slider (inside modal) ──────────────────────────────────
function initModalSlider() {
    const container     = document.getElementById('modalSliderContainer');
    const afterContainer = document.getElementById('modalAfterContainer');
    const afterImg      = document.getElementById('modalAfterImg');
    const handle        = document.getElementById('modalSliderHandle');

    if (!container || !afterContainer || !afterImg || !handle) return;

    let dragging = false;

    const update = clientX => {
        const rect = container.getBoundingClientRect();
        const pct  = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1) * 100;
        afterContainer.style.width = `${pct}%`;
        handle.style.left          = `${pct}%`;
    };

    const syncWidth = () => {
        afterImg.style.width = `${container.getBoundingClientRect().width}px`;
    };

    syncWidth();
    window.addEventListener('resize', syncWidth);

    container.addEventListener('mousedown',  e => { dragging = true; update(e.clientX); });
    window.addEventListener('mousemove',     e => { if (dragging) update(e.clientX); });
    window.addEventListener('mouseup',       ()  => { dragging = false; });

    container.addEventListener('touchstart', e => { dragging = true; update(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchmove',     e => { if (dragging) update(e.touches[0].clientX); },   { passive: true });
    window.addEventListener('touchend',      ()  => { dragging = false; });
}

// ── Lightbox ───────────────────────────────────────────────────────────────
function initLightbox() {
    const overlay = document.getElementById('lightboxOverlay');
    const img     = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!overlay) return;

    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', () => navigateLightbox(-1));
    nextBtn?.addEventListener('click', () => navigateLightbox(1));

    // Close on backdrop click (not on image)
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeLightbox();
    });

    // Touch swipe
    overlay.addEventListener('touchstart', e => {
        lbTouchStartX = e.touches[0].clientX;
    }, { passive: true });

    overlay.addEventListener('touchend', e => {
        const delta = lbTouchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) navigateLightbox(delta > 0 ? 1 : -1);
    }, { passive: true });
}

function openLightbox(index) {
    lightboxIndex = index;
    updateLightboxUI(false); // no transition on first open
    document.getElementById('lightboxOverlay')?.classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightboxOverlay')?.classList.remove('active');
}

function navigateLightbox(direction) {
    const next = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
    lightboxIndex = next;
    updateLightboxUI(true);
}

function updateLightboxUI(animate) {
    const img     = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    if (!img) return;

    if (animate) {
        img.classList.add('transitioning');
        setTimeout(() => {
            img.src = lightboxImages[lightboxIndex];
            img.classList.remove('transitioning');
        }, 200);
    } else {
        img.src = lightboxImages[lightboxIndex];
    }

    if (counter) {
        counter.textContent = `Image ${lightboxIndex + 1} of ${lightboxImages.length}`;
    }
}
