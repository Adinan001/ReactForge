import path from "path";

export function getAssetPath(assetUrl) {

    const pathname = new URL(assetUrl).pathname;

    const extension = path.extname(pathname).toLowerCase();

    const fileName = path.basename(pathname);

    const folders = {

        ".css": "assets/css",

        ".js": "assets/js",

        ".png": "assets/images",
        ".jpg": "assets/images",
        ".jpeg": "assets/images",
        ".gif": "assets/images",
        ".svg": "assets/images",
        ".webp": "assets/images",
        ".ico": "assets/images",

        ".woff": "assets/fonts",
        ".woff2": "assets/fonts",
        ".ttf": "assets/fonts",
        ".otf": "assets/fonts",
        ".eot": "assets/fonts",

        ".mp4": "assets/videos",
        ".webm": "assets/videos",
        ".ogg": "assets/videos",

        ".pdf": "assets/documents",
        ".doc": "assets/documents",
        ".docx": "assets/documents",
        ".xls": "assets/documents",
        ".xlsx": "assets/documents",
        ".zip": "assets/documents",

    };

    const folder = folders[extension] || "assets/others";

    return path.join(folder, fileName);

}