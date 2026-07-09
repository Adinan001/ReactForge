import * as cheerio from "cheerio";
import { detectResources, resourceSummary } from "./resourceDetector.js";

export function analyzeHTML(html) {

    const $ = cheerio.load(html);

    const css     = [];
    const scripts = [];
    const images  = [];
    const links   = [];

    // ── Stylesheets ─────────────────────────────────────────────────

    $("link[rel~='stylesheet']").each((_, el) => {

        const href = $(el).attr("href");
        if (href) css.push(href);

    });

    // ── Scripts ─────────────────────────────────────────────────────

    $("script[src]").each((_, el) => {

        const src = $(el).attr("src");
        if (src) scripts.push(src);

    });

    // ── Imagens (img + picture > source + srcset) ───────────────────

    $("img[src]").each((_, el) => {

        const src = $(el).attr("src");
        if (src) images.push(src);

        const srcset = $(el).attr("srcset");
        if (srcset) {
            parseSrcset(srcset).forEach(url => images.push(url));
        }

    });

    $("picture source[srcset]").each((_, el) => {
        const srcset = $(el).attr("srcset");
        if (srcset) {
            parseSrcset(srcset).forEach(url => images.push(url));
        }
    });

    // ── Links ───────────────────────────────────────────────────────

    $("a[href]").each((_, el) => {

        const href = $(el).attr("href");
        if (href) links.push(href);

    });

    // ── Recursos especiais (novo módulo) ────────────────────────────

    const resources = detectResources(html);

    return {

        title: extractCleanTitle($),

        links,
        css,
        scripts,
        images: [...new Set(images)],

        resources,

        summary: {
            links:   links.length,
            css:     css.length,
            scripts: scripts.length,
            images:  [...new Set(images)].length,
            ...resourceSummary(resources),
        },

    };

}


// ── Helpers ─────────────────────────────────────────────────────────

function extractCleanTitle($) {

    const titleEl = $("title");

    if (!titleEl.length) return "Não encontrado";

    return titleEl.first().text().trim() || "Não encontrado";
}

function parseSrcset(srcset) {

    return srcset
        .split(",")
        .map(entry => entry.trim().split(/\s+/)[0])
        .filter(url => url && url.length > 0);
}