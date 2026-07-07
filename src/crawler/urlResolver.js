export function resolveUrl(baseUrl, target) {

    if (!target) {
        return null;
    }

    try {
        return new URL(target, baseUrl).href;
    } catch {
        return null;
    }

}