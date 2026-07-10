import axios from "axios";
import fs from "fs";
import path from "path";

import { resolveUrl } from "./urlResolver.js";
import { rewriteCSS } from "./cssRewriter.js";
import { collectCSSAssets } from "./cssAssetCollector.js";
import { getAssetPath, isTrackingUrl } from "./fileOrganizer.js";

export async function downloadAssets(baseUrl, assets, siteFolder) {

    for (const asset of assets) {

        try {

            const url = resolveUrl(baseUrl, asset);

            if (!url) {
                continue;
            }

            // Ignora tracking pixels e analytics
            if (isTrackingUrl(url)) {
                continue;
            }

            const relativePath = getAssetPath(url);

            // getAssetPath retorna null pra URLs de tracking
            if (!relativePath) {
                continue;
            }

            const destination = path.join(
                siteFolder,
                relativePath
            );

            fs.mkdirSync(
                path.dirname(destination),
                { recursive: true }
            );

            if (fs.existsSync(destination)) {
                continue;
            }

            const response = await axios.get(url, {
                responseType: "arraybuffer",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                },
            });

            let data = response.data;

            // Processa arquivos CSS (incluindo Google Fonts CSS)
            const ext = path.extname(destination).toLowerCase();
            const isCSS = ext === ".css" || response.headers["content-type"]?.includes("text/css");

            if (isCSS) {

                const css = Buffer.from(data).toString("utf8");

                const cssAssets = collectCSSAssets(css);

                await downloadAssets(
                    url,
                    cssAssets,
                    siteFolder
                );

                const rewritten = rewriteCSS(css, url);

                data = Buffer.from(rewritten, "utf8");

            }

            fs.writeFileSync(destination, data);

            console.log(
                "⬇️",
                path.relative(process.cwd(), destination)
            );

        } catch (error) {

            // Silencia erros de tracking e recursos não-essenciais
            if (!isTrackingUrl(asset)) {
                console.log(
                    "⚠️ Não foi possível baixar:",
                    asset
                );
            }

        }

    }

}