import * as cheerio from "cheerio";

export function analyzeHTML(html) {

    const $ = cheerio.load(html);

    const css = [];
    const scripts = [];
    const images = [];
    const links = [];

    $("link[rel='stylesheet']").each((_, element) => {
        const href = $(element).attr("href");

        if (href) {
            css.push(href);
        }
    });

    $("script[src]").each((_, element) => {
        const src = $(element).attr("src");

        if (src) {
            scripts.push(src);
        }
    });

    $("img").each((_, element) => {
        const src = $(element).attr("src");

        if (src) {
            images.push(src);
        }
    });

    $("a").each((_, element) => {
        const href = $(element).attr("href");

        if (href) {
            links.push(href);
        }
    });

    return {
        title: $("title").text().trim() || "Não encontrado",

        links,

        css,

        scripts,

        images
    };

}