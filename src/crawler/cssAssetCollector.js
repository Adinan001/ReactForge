export function collectCSSAssets(cssContent) {

    const assets = [];

    const regex = /url\((['"]?)(.*?)\1\)/g;

    let match;

    while ((match = regex.exec(cssContent)) !== null) {

        const url = match[2];

        if (!url) {
            continue;
        }

        if (
            url.startsWith("data:") ||
            url.startsWith("#")
        ) {
            continue;
        }

        assets.push(url);

    }

    return [...new Set(assets)];

}