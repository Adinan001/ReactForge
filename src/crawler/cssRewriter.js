import { resolveUrl } from "./urlResolver.js";
import { getAssetPath } from "./fileOrganizer.js";

export function rewriteCSS(cssContent, cssUrl) {

    let rewritten = cssContent;

    // ── @import ─────────────────────────────────────────────────────

    rewritten = rewritten.replace(
        /@import\s+(?:url\(\s*(['"]?)(.*?)\1\s*\)|(['"])(.*?)\3)\s*;/g,
        (match, q1, url1, q2, url2) => {

            const url = (url1 || url2 || "").trim();

            if (!url || url.startsWith("data:")) return match;

            const absolute = resolveUrl(cssUrl, url);
            if (!absolute) return match;

            const localPath = getAssetPath(absolute).replace(/\\/g, "/");
            const relativePath = buildRelativePath("assets/css", localPath);

            return `@import url("${relativePath}");`;

        }
    );

    // ── url() ───────────────────────────────────────────────────────

    rewritten = rewritten.replace(
        /url\(\s*(['"]?)(.*?)\1\s*\)/g,
        (match, quote, url) => {

            if (!url || url.startsWith("data:") || url.startsWith("#")) {
                return match;
            }

            const absolute = resolveUrl(cssUrl, url);
            if (!absolute) return match;

            const localPath = getAssetPath(absolute).replace(/\\/g, "/");
            const relativePath = buildRelativePath("assets/css", localPath);

            return `url("${relativePath}")`;

        }
    );

    return rewritten;

}


// ── Helper ──────────────────────────────────────────────────────────

function buildRelativePath(fromDir, toPath) {

    // fromDir: "assets/css" (onde o CSS está salvo)
    // toPath:  "assets/images/logo.png" (onde o asset foi salvo)
    // Resultado: "../images/logo.png"

    const fromParts = fromDir.split("/");
    const toParts = toPath.split("/");

    // Remove partes comuns do início
    let common = 0;
    while (
        common < fromParts.length &&
        common < toParts.length &&
        fromParts[common] === toParts[common]
    ) {
        common++;
    }

    // Sobe um nível pra cada pasta restante no fromDir
    const ups = fromParts.length - common;
    const remaining = toParts.slice(common);

    const relative = "../".repeat(ups) + remaining.join("/");

    return relative;

}