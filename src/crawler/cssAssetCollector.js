export function collectCSSAssets(cssContent) {

    const assets = [];

    // ── url() em qualquer propriedade ───────────────────────────────

    const urlRegex = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
    let match;

    while ((match = urlRegex.exec(cssContent)) !== null) {

        const url = match[2].trim();

        if (!url) continue;
        if (url.startsWith("data:") || url.startsWith("#")) continue;

        assets.push(url);

    }

    // ── @import ─────────────────────────────────────────────────────

    const importRegex = /@import\s+(?:url\(\s*(['"]?)(.*?)\1\s*\)|(['"])(.*?)\3)\s*;/g;

    while ((match = importRegex.exec(cssContent)) !== null) {

        const url = (match[2] || match[4] || "").trim();

        if (!url) continue;
        if (url.startsWith("data:")) continue;

        assets.push(url);

    }

    return [...new Set(assets)];

}