import * as cheerio from "cheerio";
import { resolveUrl } from "./urlResolver.js";
import { getAssetPath } from "./fileOrganizer.js";

export function rewriteHTML(html, baseUrl) {

    const $ = cheerio.load(html);

    // ── Atributos simples (src, href, poster, data-src) ─────────────

    const simpleAttrs = [
        { selector: "link[href]",           attribute: "href" },
        { selector: "script[src]",          attribute: "src" },
        { selector: "img[src]",             attribute: "src" },
        { selector: "source[src]",          attribute: "src" },
        { selector: "video[src]",           attribute: "src" },
        { selector: "video[poster]",        attribute: "poster" },
        { selector: "audio[src]",           attribute: "src" },
        { selector: "iframe[src]",          attribute: "src" },
        { selector: "img[data-src]",        attribute: "data-src" },
        { selector: "img[data-lazy]",       attribute: "data-lazy" },
        { selector: "source[data-src]",     attribute: "data-src" },
        { selector: "video[data-src]",      attribute: "data-src" },
        { selector: "object[data]",         attribute: "data" },
        { selector: "embed[src]",           attribute: "src" },
        { selector: "input[src]",           attribute: "src" },
        { selector: "body[background]",     attribute: "background" },
        { selector: "td[background]",       attribute: "background" },
        { selector: "table[background]",    attribute: "background" },
    ];

    for (const item of simpleAttrs) {

        $(item.selector).each((_, el) => {

            const original = $(el).attr(item.attribute);

            if (!original || isDataOrAnchor(original)) return;

            const absolute = resolveUrl(baseUrl, original);
            if (!absolute) return;

            const localPath = getAssetPath(absolute);
            if (!localPath) return;

            $(el).attr(item.attribute, localPath.replace(/\\/g, "/"));

        });

    }

    // ── Srcset (img e source) ───────────────────────────────────────

    const srcsetSelectors = [
        "img[srcset]",
        "source[srcset]",
    ];

    for (const selector of srcsetSelectors) {

        $(selector).each((_, el) => {

            const srcset = $(el).attr("srcset");
            if (!srcset) return;

            const rewritten = rewriteSrcset(srcset, baseUrl);
            $(el).attr("srcset", rewritten);

        });

    }

    // ── Inline styles com url() ─────────────────────────────────────

    $("[style]").each((_, el) => {

        const style = $(el).attr("style");
        if (!style || !style.includes("url(")) return;

        const rewritten = rewriteCssUrls(style, baseUrl);
        $(el).attr("style", rewritten);

    });

    // ── <style> tags inline ─────────────────────────────────────────

    $("style").each((_, el) => {

        const css = $(el).html();
        if (!css || !css.includes("url(")) return;

        $(el).html(rewriteCssUrls(css, baseUrl));

    });

    // ── Remover atributos que quebram offline ───────────────────────

    $("[integrity]").removeAttr("integrity");
    $("[crossorigin]").removeAttr("crossorigin");

    // ── Meta tags com URLs (og:image, etc) ──────────────────────────

    const metaSelectors = [
        'meta[property="og:image"]',
        'meta[property="og:image:url"]',
        'meta[property="og:video"]',
        'meta[property="og:audio"]',
        'meta[name="twitter:image"]',
        'meta[name="msapplication-TileImage"]',
    ];

    for (const selector of metaSelectors) {

        $(selector).each((_, el) => {

            const content = $(el).attr("content");
            if (!content || isDataOrAnchor(content)) return;

            const absolute = resolveUrl(baseUrl, content);
            if (!absolute) return;

            const localPath = getAssetPath(absolute);
            if (!localPath) return;

            $(el).attr("content", localPath.replace(/\\/g, "/"));

        });

    }

    return $.html();

}


// ── Helpers ─────────────────────────────────────────────────────────

function isDataOrAnchor(url) {

    return url.startsWith("data:")
        || url.startsWith("#")
        || url.startsWith("javascript:")
        || url.startsWith("mailto:")
        || url.startsWith("tel:");

}

function rewriteSrcset(srcset, baseUrl) {

    return srcset
        .split(",")
        .map(entry => {

            const parts = entry.trim().split(/\s+/);
            const url = parts[0];
            const descriptor = parts.slice(1).join(" ");

            if (!url || isDataOrAnchor(url)) {
                return entry.trim();
            }

            const absolute = resolveUrl(baseUrl, url);
            if (!absolute) return entry.trim();

            const localPath = getAssetPath(absolute);
            if (!localPath) return entry.trim();

            return descriptor
                ? `${localPath.replace(/\\/g, "/")} ${descriptor}`
                : localPath.replace(/\\/g, "/");

        })
        .join(", ");

}

function rewriteCssUrls(css, baseUrl) {

    return css.replace(
        /url\(\s*(['"]?)([^'")]+)\1\s*\)/g,
        (match, quote, url) => {

            if (isDataOrAnchor(url)) return match;

            const absolute = resolveUrl(baseUrl, url);
            if (!absolute) return match;

            const localPath = getAssetPath(absolute);
            if (!localPath) return match;

            return `url(${quote}${localPath.replace(/\\/g, "/")}${quote})`;

        }
    );

}