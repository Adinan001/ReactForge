import { resolveUrl } from "./urlResolver.js";

export function collectInternalLinks(baseUrl, links) {

    const baseHost = new URL(baseUrl).hostname;

    const pages = new Set();

    for (const link of links) {

        const absolute = resolveUrl(baseUrl, link);

        if (!absolute) {
            continue;
        }

        try {

            const url = new URL(absolute);

            // Apenas páginas do mesmo domínio
            if (url.hostname !== baseHost) {
                continue;
            }

            // Ignora âncoras
            if (url.hash) {
                url.hash = "";
            }

            // Ignora parâmetros de consulta
            url.search = "";

            // Ignora arquivos (css, js, png, pdf...)
            const filePattern =
                /\.(jpg|jpeg|png|gif|svg|webp|css|js|json|pdf|zip|rar|mp4|mp3|woff|woff2|ttf|ico)$/i;

            if (filePattern.test(url.pathname)) {
                continue;
            }

            pages.add(url.href);

        } catch {

            continue;

        }

    }

    return [...pages].sort();

}