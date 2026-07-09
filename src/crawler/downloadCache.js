const downloadedFiles = new Set();

export function hasDownloaded(url) {

    return downloadedFiles.has(url);

}

export function registerDownload(url) {

    downloadedFiles.add(url);

}

export function clearDownloadCache() {

    downloadedFiles.clear();

}

export function totalDownloads() {

    return downloadedFiles.size;

}