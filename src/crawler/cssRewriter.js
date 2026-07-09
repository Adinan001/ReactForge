import path from "path";

export function rewriteCSS(cssContent) {

    return cssContent.replace(

        /url\((['"]?)(.*?)\1\)/g,

        (match, quote, url) => {

            // ignora data:image
            if (
                url.startsWith("data:") ||
                url.startsWith("#")
            ) {
                return match;
            }

            const file = path.basename(
                url.split("?")[0]
            );

            if (!file) {
                return match;
            }

            let folder = "media";

            const lower = file.toLowerCase();

            if (
                lower.endsWith(".woff") ||
                lower.endsWith(".woff2") ||
                lower.endsWith(".ttf") ||
                lower.endsWith(".otf") ||
                lower.endsWith(".eot")
            ) {

                folder = "fonts";

            } else if (

                lower.endsWith(".png") ||
                lower.endsWith(".jpg") ||
                lower.endsWith(".jpeg") ||
                lower.endsWith(".gif") ||
                lower.endsWith(".svg") ||
                lower.endsWith(".webp")

            ) {

                folder = "images";

            }

            return `url("../${folder}/${file}")`;

        }

    );

}