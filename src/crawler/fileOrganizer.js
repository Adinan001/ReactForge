import path from "path";

const EXTENSION_FOLDERS = {
    ".css":   "assets/css",
    ".js":    "assets/js",
    ".mjs":   "assets/js",
    ".png":   "assets/images",
    ".jpg":   "assets/images",
    ".jpeg":  "assets/images",
    ".gif":   "assets/images",
    ".svg":   "assets/images",
    ".webp":  "assets/images",
    ".avif":  "assets/images",
    ".ico":   "assets/images",
    ".woff":  "assets/fonts",
    ".woff2": "assets/fonts",
    ".ttf":   "assets/fonts",
    ".otf":   "assets/fonts",
    ".eot":   "assets/fonts",
    ".mp4":   "assets/videos",
    ".webm":  "assets/videos",
    ".ogg":   "assets/videos",
    ".mp3":   "assets/audios",
    ".wav":   "assets/audios",
    ".pdf":   "assets/documents",
    ".doc":   "assets/documents",
    ".docx":  "assets/documents",
    ".xls":   "assets/documents",
    ".xlsx":  "assets/documents",
    ".zip":   "assets/documents",
    ".json":  "assets/others",
};

// ── Domínios de fontes conhecidos ───────────────────────────────────

const FONT_CSS_HOSTS = [
    "fonts.googleapis.com",
    "fonts.bunny.net",
    "use.typekit.net",
];

const FONT_FILE_HOSTS = [
    "fonts.gstatic.com",
    "use.typekit.net",
    "fast.fonts.net",
];

// ── Hosts de tracking/analytics a ignorar ───────────────────────────

const TRACKING_HOSTS = [
    "googleads.g.doubleclick.net",
    "www.googletagmanager.com",
    "www.google-analytics.com",
    "analytics.google.com",
    "px.ads.linkedin.com",
    "bat.bing.com",
    "www.facebook.com",
    "connect.facebook.net",
    "snap.licdn.com",
    "ad.doubleclick.net",
    "cdn.segment.com",
    "cdn.mxpnl.com",
];

export function getAssetPath(assetUrl) {

    let parsed;

    try {
        parsed = new URL(assetUrl);
    } catch {
        return path.join("assets/others", sanitizeFileName(assetUrl));
    }

    const hostname = parsed.hostname.toLowerCase();

    // ── Filtro de tracking ──────────────────────────────────────────

    if (isTrackingUrl(parsed)) {
        return null;
    }

    // ── Google Fonts CSS ────────────────────────────────────────────

    if (FONT_CSS_HOSTS.includes(hostname)) {

        const family = parsed.searchParams.get("family") || "webfont";
        const safeName = sanitizeFileName(family.split(":")[0]) + ".css";

        return path.join("assets/css", safeName);

    }

    // ── Arquivos de fontes (gstatic, etc) ───────────────────────────

    if (FONT_FILE_HOSTS.includes(hostname)) {

        const pathname = parsed.pathname;
        const fileName = path.basename(pathname);

        return path.join("assets/fonts", fileName);

    }

    // ── Caminho padrão ──────────────────────────────────────────────

    const pathname = parsed.pathname;
    const extension = path.extname(pathname).toLowerCase();
    let fileName = path.basename(pathname);

    // Se não tem extensão ou nome válido, gera um nome
    if (!fileName || fileName === "/" || !extension) {

        // Tenta inferir tipo pelo path
        if (pathname.includes("/css")) {
            fileName = sanitizeFileName(pathname) + ".css";
            return path.join("assets/css", fileName);
        }

        if (pathname.includes("/js")) {
            fileName = sanitizeFileName(pathname) + ".js";
            return path.join("assets/js", fileName);
        }

        fileName = sanitizeFileName(pathname + parsed.search) || "unknown";
        return path.join("assets/others", fileName);

    }

    const folder = EXTENSION_FOLDERS[extension] || "assets/others";

    return path.join(folder, fileName);

}

export function isTrackingUrl(urlOrString) {

    let parsed;

    try {
        parsed = typeof urlOrString === "string"
            ? new URL(urlOrString)
            : urlOrString;
    } catch {
        return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    if (TRACKING_HOSTS.some(h => hostname.includes(h))) {
        return true;
    }

    // Pixels de tracking comuns (1x1 images, sem extensão)
    const pathname = parsed.pathname.toLowerCase();
    const trackingPaths = ["/pixel", "/pxl", "/seg", "/px", "/tr"];

    if (trackingPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
        return true;
    }

    return false;

}

export function isFontCssUrl(url) {

    try {
        const parsed = new URL(url);
        return FONT_CSS_HOSTS.includes(parsed.hostname.toLowerCase());
    } catch {
        return false;
    }

}


// ── Helper ──────────────────────────────────────────────────────────

function sanitizeFileName(str) {

    return str
        .replace(/^\/+/, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .substring(0, 100);

}