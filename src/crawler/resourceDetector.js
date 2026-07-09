import * as cheerio from "cheerio";

// ── Categorias de recursos ──────────────────────────────────────────

const LINK_REL_MAP = {
    "icon":             "favicon",
    "shortcut icon":    "favicon",
    "apple-touch-icon": "favicon",
    "apple-touch-icon-precomposed": "favicon",
    "manifest":         "manifest",
    "preload":          "preload",
    "prefetch":         "prefetch",
    "dns-prefetch":     "dns-prefetch",
    "preconnect":       "preconnect",
    "modulepreload":    "modulepreload",
    "mask-icon":        "favicon",
    "canonical":        "seo",
    "alternate":        "seo",
    "author":           "seo",
    "amphtml":          "seo",
    "prev":             "pagination",
    "next":             "pagination",
};

// ── Detector principal ──────────────────────────────────────────────

export function detectResources(html) {

    const $ = cheerio.load(html);

    const detected = {
        favicons:       [],
        manifest:       null,
        preload:        [],
        prefetch:       [],
        preconnect:     [],
        dnsPrefetch:    [],
        modulepreload:  [],
        seo:            [],
        pagination:     [],
        videos:         [],
        audios:         [],
        iframes:        [],
        fonts:          [],
        meta:           extractMeta($),
        openGraph:      extractOpenGraph($),
        jsonLd:         extractJsonLd($),
    };

    // ── <link> tags ─────────────────────────────────────────────────

    $("link").each((_, el) => {

        const href = $(el).attr("href");
        const rel  = ($(el).attr("rel") || "").toLowerCase().trim();
        const type = ($(el).attr("type") || "").toLowerCase();
        const as   = ($(el).attr("as")   || "").toLowerCase();

        if (!href && !rel.includes("dns-prefetch")) return;

        const category = LINK_REL_MAP[rel];

        if (!category) return;

        const entry = buildLinkEntry($, el, href, rel, type, as);

        switch (category) {
            case "favicon":
                detected.favicons.push(entry);
                break;
            case "manifest":
                detected.manifest = entry;
                break;
            case "preload":
                detected.preload.push(entry);
                if (as === "font") detected.fonts.push(entry);
                break;
            case "prefetch":
                detected.prefetch.push(entry);
                break;
            case "preconnect":
                detected.preconnect.push(entry);
                break;
            case "dns-prefetch":
                detected.dnsPrefetch.push(entry);
                break;
            case "modulepreload":
                detected.modulepreload.push(entry);
                break;
            case "seo":
                detected.seo.push(entry);
                break;
            case "pagination":
                detected.pagination.push(entry);
                break;
        }
    });

    // ── Fontes via @font-face em <style> inline ─────────────────────

    $("style").each((_, el) => {
        const css = $(el).html() || "";
        const fontUrls = extractFontUrlsFromCSS(css);
        for (const url of fontUrls) {
            detected.fonts.push({ href: url, source: "inline-style" });
        }
    });

    // ── <video> ─────────────────────────────────────────────────────

    $("video").each((_, el) => {

        const video = {
            src:    $(el).attr("src") || null,
            poster: $(el).attr("poster") || null,
            sources: [],
        };

        $(el).find("source").each((_, src) => {
            video.sources.push({
                src:  $(src).attr("src") || null,
                type: $(src).attr("type") || null,
            });
        });

        if (video.src || video.sources.length > 0) {
            detected.videos.push(video);
        }
    });

    // ── <audio> ─────────────────────────────────────────────────────

    $("audio").each((_, el) => {

        const audio = {
            src: $(el).attr("src") || null,
            sources: [],
        };

        $(el).find("source").each((_, src) => {
            audio.sources.push({
                src:  $(src).attr("src") || null,
                type: $(src).attr("type") || null,
            });
        });

        if (audio.src || audio.sources.length > 0) {
            detected.audios.push(audio);
        }
    });

    // ── <iframe> ────────────────────────────────────────────────────

    $("iframe").each((_, el) => {

        const src = $(el).attr("src") || $(el).attr("data-src") || null;

        if (src) {
            detected.iframes.push({
                src,
                title:  $(el).attr("title") || null,
                width:  $(el).attr("width") || null,
                height: $(el).attr("height") || null,
                loading: $(el).attr("loading") || null,
            });
        }
    });

    return detected;
}


// ── Helpers ─────────────────────────────────────────────────────────

function buildLinkEntry($, el, href, rel, type, as) {

    const entry = { rel, href };

    if (type) entry.type = type;
    if (as)   entry.as   = as;

    const sizes      = $(el).attr("sizes");
    const crossorigin = $(el).attr("crossorigin");
    const media      = $(el).attr("media");
    const hreflang   = $(el).attr("hreflang");
    const color      = $(el).attr("color");

    if (sizes)       entry.sizes       = sizes;
    if (crossorigin) entry.crossorigin = crossorigin;
    if (media)       entry.media       = media;
    if (hreflang)    entry.hreflang    = hreflang;
    if (color)       entry.color       = color;

    return entry;
}

function extractMeta($) {

    const meta = {};

    $("meta").each((_, el) => {

        const name    = $(el).attr("name") || $(el).attr("http-equiv");
        const content = $(el).attr("content");
        const charset = $(el).attr("charset");

        if (charset) {
            meta.charset = charset;
        } else if (name && content) {
            meta[name.toLowerCase()] = content;
        }
    });

    return meta;
}

function extractOpenGraph($) {

    const og = {};

    $('meta[property^="og:"]').each((_, el) => {
        const prop    = $(el).attr("property").replace("og:", "");
        const content = $(el).attr("content");
        if (content) og[prop] = content;
    });

    $('meta[property^="twitter:"]').each((_, el) => {
        const prop    = $(el).attr("property") || $(el).attr("name") || "";
        const content = $(el).attr("content");
        if (content) og[prop] = content;
    });

    return Object.keys(og).length > 0 ? og : null;
}

function extractJsonLd($) {

    const schemas = [];

    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($(el).html());
            schemas.push(json);
        } catch {
            // JSON inválido, ignora
        }
    });

    return schemas.length > 0 ? schemas : null;
}

function extractFontUrlsFromCSS(css) {

    const urls = [];
    const regex = /url\(\s*['"]?([^'")]+\.(?:woff2?|ttf|otf|eot)[^'")]*?)['"]?\s*\)/gi;
    let match;

    while ((match = regex.exec(css)) !== null) {
        urls.push(match[1]);
    }

    return urls;
}


// ── Resumo para log ─────────────────────────────────────────────────

export function resourceSummary(detected) {

    const summary = {};

    if (detected.favicons.length)      summary["🔖 Favicons"]       = detected.favicons.length;
    if (detected.manifest)             summary["📋 Manifest"]       = 1;
    if (detected.preload.length)       summary["⚡ Preload"]        = detected.preload.length;
    if (detected.prefetch.length)      summary["📦 Prefetch"]       = detected.prefetch.length;
    if (detected.preconnect.length)    summary["🔗 Preconnect"]     = detected.preconnect.length;
    if (detected.dnsPrefetch.length)   summary["🌐 DNS-Prefetch"]   = detected.dnsPrefetch.length;
    if (detected.modulepreload.length) summary["📦 Modulepreload"]  = detected.modulepreload.length;
    if (detected.fonts.length)         summary["🔤 Fonts"]          = detected.fonts.length;
    if (detected.videos.length)        summary["🎬 Vídeos"]         = detected.videos.length;
    if (detected.audios.length)        summary["🔊 Áudios"]        = detected.audios.length;
    if (detected.iframes.length)       summary["📺 Iframes"]        = detected.iframes.length;
    if (detected.seo.length)           summary["🔍 SEO Links"]      = detected.seo.length;
    if (detected.openGraph)            summary["📱 Open Graph"]     = Object.keys(detected.openGraph).length;
    if (detected.jsonLd)               summary["📊 JSON-LD"]        = detected.jsonLd.length;

    return summary;
}