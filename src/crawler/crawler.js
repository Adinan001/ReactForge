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

        // ── Log da análise básica ───────────────────────────────────

        console.log("");
        console.log("========== ANÁLISE ==========");
        console.log("🏷️  Título:", analysis.title);
        console.log("🔗 Links encontrados:", analysis.summary.links);
        console.log("🎨 CSS encontrados:", analysis.summary.css);
        console.log("📜 Scripts encontrados:", analysis.summary.scripts);
        console.log("🖼️  Imagens encontradas:", analysis.summary.images);

        // ── Log dos recursos especiais ──────────────────────────────

        const specialKeys = Object.keys(analysis.summary).filter(
            k => !["links", "css", "scripts", "images"].includes(k)
        );

        if (specialKeys.length > 0) {

            console.log("─── Recursos Especiais ───");

            for (const key of specialKeys) {
                console.log(`  ${key}: ${analysis.summary[key]}`);
            }

        }

        console.log("=============================");

        // ── Log detalhado dos recursos ──────────────────────────────

        const res = analysis.resources;

        if (res.favicons.length > 0) {
            console.log("");
            console.log("🔖 Favicons:");
            for (const f of res.favicons) {
                console.log(`  ${f.rel} → ${f.href}${f.sizes ? ` (${f.sizes})` : ""}`);
            }
        }

        if (res.manifest) {
            console.log("");
            console.log("📋 Manifest:", res.manifest.href);
        }

        if (res.preconnect.length > 0) {
            console.log("");
            console.log("🔗 Preconnect:");
            for (const p of res.preconnect) {
                console.log(`  → ${p.href}`);
            }
        }

        if (res.openGraph) {
            console.log("");
            console.log("📱 Open Graph:");
            for (const [key, value] of Object.entries(res.openGraph)) {
                console.log(`  ${key}: ${value}`);
            }
        }

        // ── Download dos assets ─────────────────────────────────────

        await downloadAssets(url, analysis.css, siteFolder);

        await downloadAssets(url, analysis.scripts, siteFolder);

        await downloadAssets(url, analysis.images, siteFolder);

        // Download dos favicons e manifest
        const faviconUrls = res.favicons.map(f => f.href).filter(Boolean);
        if (faviconUrls.length > 0) {
            await downloadAssets(url, faviconUrls, siteFolder);
        }

        if (res.manifest && res.manifest.href) {
            await downloadAssets(url, [res.manifest.href], siteFolder);
        }

        // Download de fonts encontradas
        const fontUrls = res.fonts
            .map(f => f.href)
            .filter(href => href && !href.startsWith("data:"));

        if (fontUrls.length > 0) {
            await downloadAssets(url, fontUrls, siteFolder);
        }

        // ── Salvar HTML ─────────────────────────────────────────────

        html = rewriteHTML(html, url);

        fs.writeFileSync(
            path.join(siteFolder, "index.html"),
            html
        );

        console.log("");
        console.log(
            "💾 HTML salvo:",
            path.join(siteFolder, "index.html")
        );

        // ── Crawl das páginas ───────────────────────────────────────

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