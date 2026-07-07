import axios from "axios";
import fs from "fs";
import path from "path";

import { analyzeHTML } from "./analyzer.js";
import { collectInternalLinks } from "./linkCollector.js";
import { downloadAssets } from "./assetDownloader.js";

export async function crawlSite(startUrl, siteFolder, maxPages = 50) {

    const visited = new Set();
    const queue = [startUrl];

    while (queue.length > 0 && visited.size < maxPages) {

        const currentUrl = queue.shift();

        if (visited.has(currentUrl)) {
            continue;
        }

        visited.add(currentUrl);

        console.log("");
        console.log("📄 Página:", currentUrl);

        try {

            const response = await axios.get(currentUrl);

            const html = response.data;

            const analysis = analyzeHTML(html);

            const url = new URL(currentUrl);

            let pagePath = url.pathname;

            if (pagePath === "" || pagePath === "/") {

                pagePath = "index.html";

            } else {

                pagePath = pagePath.replace(/^\/+/, "");

                if (!pagePath.endsWith(".html")) {

                    pagePath = path.join(pagePath, "index.html");

                }

            }

            const fullPath = path.join(siteFolder, pagePath);

            fs.mkdirSync(path.dirname(fullPath), {
                recursive: true
            });

            fs.writeFileSync(fullPath, html);

            console.log("💾", fullPath);

            // Baixa CSS
            await downloadAssets(
                currentUrl,
                analysis.css,
                path.join(siteFolder, "css")
            );

            // Baixa JavaScript
            await downloadAssets(
                currentUrl,
                analysis.scripts,
                path.join(siteFolder, "js")
            );

            // Baixa imagens
            await downloadAssets(
                currentUrl,
                analysis.images,
                path.join(siteFolder, "img")
            );

            // Descobre novas páginas
            const internalLinks = collectInternalLinks(
                currentUrl,
                analysis.links
            );

            for (const page of internalLinks) {

                if (
                    !visited.has(page) &&
                    !queue.includes(page)
                ) {

                    queue.push(page);

                }

            }

        } catch (error) {

            console.log("⚠️ Erro:", error.message);

        }

    }

    console.log("");
    console.log("✅ Páginas visitadas:", visited.size);

    return [...visited];

}