/**
 * PRIMA CONSTRUK — Project Registry
 * ─────────────────────────────────────────────────────────────
 * HOW TO ADD A NEW PROJECT:
 *   1. Create a folder:  assets/your-project-id/
 *   2. Add your images inside it (cover.jpg, before.jpeg, etc.)
 *   3. Copy one of the entries below and paste it at the end of
 *      the PRIMA_PROJECTS array. Update all fields accordingly.
 *   4. Leave beforeImage / afterImage as "" if not available.
 * ─────────────────────────────────────────────────────────────
 */
window.PRIMA_PROJECTS = [

    // ── L RESIDENCE ─────────────────────────────────────────
    {
        id          : "l-residence",
        title       : "L Residence",
        location    : "Taguig City, Metro Manila",
        year        : "2025",
        summary     : "A bespoke turnkey design, build, and styling project featuring olive sectional arrangements and travertine stone craftsmanship.",
        description : "A full turnkey design-build-style project completed in 2025. The residence features elegant drop ceilings with ambient warm lighting, sleek track spotlights, custom travertine stone coffee tables, and floor-to-ceiling sheer drapery. An olive green modular sectional anchors the space, providing a soft natural texture that harmonises with the light oak flooring. Built to convey luxury through architectural restraint and premium materiality.",
        coverImage  : "cover.jpg",
        beforeImage : "before.jpeg",
        afterImage  : "after.jpg",
        gallery     : [
            "cover.jpg",
            "after.jpg",
            "detail1.jpg",
            "detail2.jpg",
            "detail3.jpg",
            "detail4.jpg",
            "detail5.jpg",
            "detail6.jpg",
            "detail7.jpg",
            "detail8.jpg"
        ],
        highlights  : [
            { label: "Custom Millwork",  value: "100% Oak"     },
            { label: "Natural Accents",  value: "Travertine"   },
            { label: "Color Palette",    value: "Olive & Cream" },
            { label: "Scope",            value: "Turnkey"      }
        ]
    },

    // ── BGC RESIDENCE ────────────────────────────────────────
    {
        id          : "bgc-tower",
        title       : "BGC Residence",
        location    : "Bonifacio Global City, Taguig",
        year        : "2026",
        summary     : "A character-led city residence shaped by warm colour, expressive objects, and sculptural lines.",
        description : "A compact BGC residence transformed into a vivid, deeply personal home. Rust-toned seating and cocoa drapery bring warmth to the open living area, while playful art, sculptural dining chairs, layered lighting, and an illuminated arched bedroom feature create a distinct point of view from room to room.",
        coverImage  : "detail4.jpg",
        beforeImage : "",
        afterImage  : "",
        gallery     : [
            "cover.jpg",
            "detail1.jpg",
            "detail2.jpg",
            "detail3.jpg",
            "detail4.jpg",
            "detail5.jpg",
            "detail6.jpg"
        ],
        highlights  : [
            { label: "Project Type", value: "City Residence" },
            { label: "Palette",      value: "Rust & Cocoa" },
            { label: "Feature",      value: "Sculptural Arch" },
            { label: "Scope",        value: "Interior Transformation" }
        ]
    }

    // ── ADD NEXT PROJECT HERE ────────────────────────────────
    // ,{
    //     id          : "your-project-id",
    //     title       : "Project Name",
    //     location    : "City, Country",
    //     year        : "2026",
    //     summary     : "One-line teaser shown on the portfolio card.",
    //     description : "Full paragraph description shown inside the modal.",
    //     coverImage  : "cover.jpg",
    //     beforeImage : "before.jpg",   // leave "" if no before/after
    //     afterImage  : "after.jpg",
    //     gallery     : ["cover.jpg", "detail1.jpg"],
    //     highlights  : [
    //         { label: "Material", value: "Description" }
    //     ]
    // }
];
