import axios from "axios";
import fs from "fs";
import path from "path";

import { resolveUrl } from "./urlResolver.js";
import { rewriteCSS } from "./cssRewriter.js";
import { collectCSSAssets } from "./cssAssetCollector.js";
import { getAssetPath, isTrackingUrl } from "./fileOrganizer.js";
import { trackDownload } from "../export/coverageReport.js";

const MAX_CONCURRENT = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export async function downloadAssets(baseUrl, assets, siteFolder) {

    // Prepara lista de downloads válidos
    const tasks = [];

    for (const asset of assets) {

        const url = resolveUrl(baseUrl, asset);

        if (!url) continue;
        if (isTrackingUrl(url)) continue;

        const relativePath = getAssetPath(url);
        if (!relativePath) continue;

        const destination = path.join(siteFolder, relativePath);

        if (fs.existsSync(destination)) continue;

        tasks.push({ url, destination, baseUrl });

    }

    // Baixa em lotes paralelos
    const chunks = chunkArray(tasks, MAX_CONCURRENT);

    for (const chunk of chunks) {

        const promises = chunk.map(task => downloadSingle(task, siteFolder));

        await Promise.allSettled(promises);

    }

}

async function downloadSingle(task, siteFolder) {

    const { url, destination } = task;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

            fs.mkdirSync(path.dirname(destination), { recursive: true });

            // Pula se outro download paralelo já criou o arquivo
            if (fs.existsSync(destination)) return;

            const response = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 30000,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                },
            });

            let data = response.data;

            // Processa arquivos CSS
            const ext = path.extname(destination).toLowerCase();
            const isCSS = ext === ".css" || response.headers["content-type"]?.includes("text/css");

            if (isCSS) {

                const css = Buffer.from(data).toString("utf8");

                const cssAssets = collectCSSAssets(css);

                // CSS assets são baixados sequencialmente pra evitar recursão infinita
                await downloadAssets(url, cssAssets, siteFolder);

                const rewritten = rewriteCSS(css, url);

                data = Buffer.from(rewritten, "utf8");

            }

            fs.writeFileSync(destination, data);

            trackDownload(url, destination, true);

            console.log(
                "⬇️",
                path.relative(process.cwd(), destination)
            );

            return;

        } catch (error) {

            if (attempt < MAX_RETRIES) {

                const delay = RETRY_DELAY * attempt;
                await sleep(delay);

            } else {

                trackDownload(url, destination, false);

                console.log(
                    "⚠️ Falhou após",
                    MAX_RETRIES,
                    "tentativas:",
                    path.basename(destination)
                );

            }

        }

    }

}


// ── Helpers ─────────────────────────────────────────────────────────

function chunkArray(arr, size) {

    const chunks = [];

    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }

    return chunks;

}

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}