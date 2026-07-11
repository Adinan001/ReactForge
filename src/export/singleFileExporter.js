import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

export function exportSingleFile(siteFolder) {

    const indexPath = path.join(siteFolder, "index.html");

    if (!fs.existsSync(indexPath)) {
        console.log("⚠️ index.html não encontrado em", siteFolder);
        return null;
    }

    let html = fs.readFileSync(indexPath, "utf8");
    const $ = cheerio.load(html);

    // ── Inline CSS ──────────────────────────────────────────────────

    $('link[rel="stylesheet"]').each((_, el) => {

        const href = $(el).attr("href");
        if (!href) return;

        const cssPath = path.join(siteFolder, href);

        if (fs.existsSync(cssPath)) {
            const css = fs.readFileSync(cssPath, "utf8");
            const inlinedCss = inlineCssUrls(css, path.dirname(cssPath));
            $(el).replaceWith(`<style>${inlinedCss}</style>`);
        }

    });

    // ── Inline JS ───────────────────────────────────────────────────

    $("script[src]").each((_, el) => {

        const src = $(el).attr("src");
        if (!src) return;

        const jsPath = path.join(siteFolder, src);

        if (fs.existsSync(jsPath)) {
            const js = fs.readFileSync(jsPath, "utf8");
            $(el).removeAttr("src");
            $(el).html(js);
        }

    });

    // ── Inline Images ───────────────────────────────────────────────

    $("img[src]").each((_, el) => {

        const src = $(el).attr("src");
        if (!src || src.startsWith("data:")) return;

        const imgPath = path.join(siteFolder, src);

        if (fs.existsSync(imgPath)) {
            const base64 = fileToBase64(imgPath);
            if (base64) $(el).attr("src", base64);
        }

    });

    // ── Inline favicons ─────────────────────────────────────────────

    $('link[rel*="icon"]').each((_, el) => {

        const href = $(el).attr("href");
        if (!href) return;

        const iconPath = path.join(siteFolder, href);

        if (fs.existsSync(iconPath)) {
            const base64 = fileToBase64(iconPath);
            if (base64) $(el).attr("href", base64);
        }

    });

    // ── Salvar ──────────────────────────────────────────────────────

    const outputName = path.basename(siteFolder) + "-single.html";
    const outputPath = path.join(siteFolder, "..", outputName);

    fs.writeFileSync(outputPath, $.html());

    const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);

    console.log("");
    console.log(`📄 Single-file criado: ${outputPath}`);
    console.log(`   Tamanho: ${sizeMB} MB`);

    return outputPath;

}


// ── Helpers ─────────────────────────────────────────────────────────

function fileToBase64(filePath) {

    try {

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            ".png":   "image/png",
            ".jpg":   "image/jpeg",
            ".jpeg":  "image/jpeg",
            ".gif":   "image/gif",
            ".svg":   "image/svg+xml",
            ".webp":  "image/webp",
            ".ico":   "image/x-icon",
            ".woff":  "font/woff",
            ".woff2": "font/woff2",
            ".ttf":   "font/ttf",
            ".otf":   "font/otf",
        };

        const mime = mimeTypes[ext] || "application/octet-stream";
        const data = fs.readFileSync(filePath);

        return `data:${mime};base64,${data.toString("base64")}`;

    } catch {
        return null;
    }

}

function inlineCssUrls(css, cssDir) {

    return css.replace(
        /url\(\s*(['"]?)([^'")]+)\1\s*\)/g,
        (match, quote, url) => {

            if (url.startsWith("data:") || url.startsWith("#")) {
                return match;
            }

            const filePath = path.join(cssDir, url.split("?")[0]);

            if (fs.existsSync(filePath)) {
                const base64 = fileToBase64(filePath);
                if (base64) return `url("${base64}")`;
            }

            return match;

        }
    );

}