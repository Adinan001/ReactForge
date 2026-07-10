import axios from "axios";
import fs from "fs";
import path from "path";
import { analyzeHTML } from "./analyzer.js";
import { collectInternalLinks } from "./linkCollector.js";
import { downloadAssets } from "./assetDownloader.js";
import { rewriteHTML } from "./htmlRewriter.js";
import { fetchRobotsTxt, isAllowed } from "./robotsParser.js";
import { saveState, loadState, clearState } from "./crawlState.js";

export async function crawlSite(startUrl, siteFolder, maxPages = 50, requestDelay = 0) {

    let visited;
    let queue;

    // Tenta retomar crawl anterior
    const previous = loadState(siteFolder);

    if (previous) {

        visited = previous.visited;
        queue = previous.queue;

        console.log("🔄 Retomando crawl...");

    } else {

        visited = new Set();
        queue = [startUrl];

    }

    // Carrega robots.txt uma vez
    const robots = await fetchRobotsTxt(startUrl);
    const delay = Math.max(robots.crawlDelay || 0, requestDelay);

    if (delay > 0) {
        console.log(`⏱️ Delay: ${delay}ms entre requests`);
    }

    try {

        while (queue.length > 0 && visited.size < maxPages) {

            const currentUrl = queue.shift();

            // Normaliza URL removendo trailing slash pra evitar duplicata
            const normalized = currentUrl.replace(/\/+$/, "") || currentUrl;

            if (visited.has(normalized)) {
                continue;
            }

            // Verifica robots.txt
            if (!isAllowed(currentUrl, robots)) {
                console.log("");
                console.log("🚫 Bloqueado por robots.txt:", currentUrl);
                continue;
            }

            visited.add(normalized);

            console.log("");
            console.log("📄 Página:", currentUrl);

            try {

                // Respeita delay (crawl-delay ou --delay)
                if (delay > 0 && visited.size > 1) {
                    await sleep(delay);
                }

                const response = await axios.get(currentUrl);
                let html = response.data;

                const analysis = analyzeHTML(html);

                await downloadAssets(currentUrl, analysis.css, siteFolder);
                await downloadAssets(currentUrl, analysis.scripts, siteFolder);
                await downloadAssets(currentUrl, analysis.images, siteFolder);

                // Download dos favicons e manifest detectados
                const res = analysis.resources;

                const faviconUrls = res.favicons.map(f => f.href).filter(Boolean);
                if (faviconUrls.length > 0) {
                    await downloadAssets(currentUrl, faviconUrls, siteFolder);
                }

                if (res.manifest && res.manifest.href) {
                    await downloadAssets(currentUrl, [res.manifest.href], siteFolder);
                }

                // Determina caminho do arquivo
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

                // Reescreve URLs com profundidade correta
                html = rewriteHTML(html, currentUrl, pagePath);

                const fullPath = path.join(siteFolder, pagePath);

                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, html);

                console.log("💾", fullPath);

                // Coleta links internos pra continuar o crawl
                const internalLinks = collectInternalLinks(currentUrl, analysis.links);

                for (const page of internalLinks) {
                    const norm = page.replace(/\/+$/, "") || page;
                    if (!visited.has(norm) && !queue.includes(page)) {
                        queue.push(page);
                    }
                }

                // Salva estado a cada 5 páginas
                if (visited.size % 5 === 0) {
                    saveState(siteFolder, visited, queue);
                }

            } catch (error) {
                console.log("⚠️ Erro:", error.message);
            }

        }

        // Crawl completo — limpa estado
        clearState(siteFolder);

    } catch (error) {

        // Erro fatal — salva estado pra retomar depois
        console.log("");
        console.log("💾 Salvando progresso pra retomar depois...");
        saveState(siteFolder, visited, queue);

        throw error;

    }

    console.log("");
    console.log("✅ Páginas visitadas:", visited.size);

    return [...visited];

}


// ── Helper ──────────────────────────────────────────────────────────

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}