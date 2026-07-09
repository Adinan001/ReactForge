import axios from "axios";
import fs from "fs";
import path from "path";

import { analyzeHTML } from "./analyzer.js";
import { downloadAssets } from "./assetDownloader.js";
import { crawlSite } from "./siteCrawler.js";
import { rewriteHTML } from "./htmlRewriter.js";

export async function startCrawler(url) {

    console.log("");
    console.log("🚀 Crawler iniciado");
    console.log("🌎 Baixando:", url);

    try {

        const response = await axios.get(url);

        let html = response.data;

        console.log("");
        console.log("✅ Site acessado com sucesso!");
        console.log("📄 Status:", response.status);
        console.log("📏 Tamanho HTML:", html.length, "caracteres");

        const siteName = new URL(url).hostname.replace(/^www\./, "");

        const siteFolder = path.join("sites", siteName);

        fs.mkdirSync(siteFolder, {
            recursive: true
        });

        const analysis = analyzeHTML(html);

        console.log("");
        console.log("========== ANÁLISE ==========");
        console.log("🏷️ Título:", analysis.title);
        console.log("🔗 Links encontrados:", analysis.links.length);
        console.log("🎨 CSS encontrados:", analysis.css.length);
        console.log("📜 Scripts encontrados:", analysis.scripts.length);
        console.log("🖼️ Imagens encontradas:", analysis.images.length);
        console.log("=============================");

        await downloadAssets(
            url,
            analysis.css,
            siteFolder
        );

        await downloadAssets(
            url,
            analysis.scripts,
            siteFolder
        );

        await downloadAssets(
            url,
            analysis.images,
            siteFolder
        );

        html = rewriteHTML(html);

        fs.writeFileSync(
            path.join(siteFolder, "index.html"),
            html
        );

        console.log(
            "💾 HTML salvo:",
            path.join(siteFolder, "index.html")
        );

        console.log("");
        console.log("🕷️ Iniciando varredura das páginas...");

        const pages = await crawlSite(
            url,
            siteFolder,
            20
        );

        console.log("");
        console.log("✅ Total de páginas:", pages.length);

        return {
            html,
            analysis,
            pages,
            siteFolder
        };

    } catch (error) {

        console.log("");
        console.log("❌ Erro:");
        console.log(error.message);

        return null;

    }

}