import * as cheerio from "cheerio";
import { resolveUrl } from "./urlResolver.js";
import { getAssetPath } from "./fileOrganizer.js";

export function rewriteHTML(html, baseUrl) {

    const $ = cheerio.load(html);

    const attributes = [
        { selector: "link[href]", attribute: "href" },
        { selector: "script[src]", attribute: "src" },
        { selector: "img[src]", attribute: "src" },
        { selector: "source[src]", attribute: "src" }
    ];

    for (const item of attributes) {

        $(item.selector).each((_, element) => {

            const original = $(element).attr(item.attribute);

            if (!original) {
                return;
            }

            const absolute = resolveUrl(baseUrl, original);

            if (!absolute) {
                return;
            }

            const localPath = getAssetPath(absolute);

            $(element).attr(item.attribute, localPath.replace(/\\/g, "/"));

        });

    }

    return $.html();

}