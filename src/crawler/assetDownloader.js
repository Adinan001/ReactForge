import axios from "axios";
import fs from "fs";
import path from "path";

import { resolveUrl } from "./urlResolver.js";
import { rewriteCSS } from "./cssRewriter.js";
import { collectCSSAssets } from "./cssAssetCollector.js";
import { getAssetPath } from "./fileOrganizer.js";

export async function downloadAssets(baseUrl, assets, siteFolder) {

    for (const asset of assets) {

        try {

            const url = resolveUrl(baseUrl, asset);

            if (!url) {
                continue;
            }

            const relativePath = getAssetPath(url);

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
                responseType: "arraybuffer"
            });

            let data = response.data;

            if (path.extname(destination).toLowerCase() === ".css") {

                const css = Buffer.from(data).toString("utf8");

                const cssAssets = collectCSSAssets(css);

                await downloadAssets(
                    url,
                    cssAssets,
                    siteFolder
                );

                const rewritten = rewriteCSS(css);

                data = Buffer.from(rewritten, "utf8");

            }

            fs.writeFileSync(destination, data);

            console.log(
                "⬇️",
                path.relative(process.cwd(), destination)
            );

        } catch (error) {

            console.log(
                "⚠️ Não foi possível baixar:",
                asset
            );

        }

    }

}