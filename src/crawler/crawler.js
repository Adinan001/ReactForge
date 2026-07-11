import axios from "axios";
import fs from "fs";
import path from "path";

import { analyzeHTML } from "./analyzer.js";
import { downloadAssets } from "./assetDownloader.js";
import { crawlSite } from "./siteCrawler.js";
import { rewriteHTML } from "./htmlRewriter.js";
import { fetchWithBrowser, needsBrowser, closeBrowser } from "./browserFetcher.js";
import { initLogger, closeLogger } from "../utils/logger.js";

export async function startCrawler(url, options = {}) {

    const { forceBrowser = false, delay = 0, maxPages = 20, quiet = false, output = null, userAgent = null } = options;

    const siteName = new URL(url).hostname.replace(/^www\./, "");
    const baseDir = output || "sites";
    const siteFolder = path.join(baseDir, siteName);

    fs.mkdirSync(siteFolder, { recursive: true });

    // Inicia logger em arquivo
    initLogger(siteFolder);

    console.log("");
    console.log("🚀 Crawler iniciado");
    console.log("🌎 Baixando:", url);

    try {

        let html = null;
        let status = 0;
        let usedBrowser = false;

        // User-Agent padrão ou customizado
        const ua = userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

        // ── Tentativa 1: Axios (rápido, sem custo) ──────────────────

        if (!forceBrowser) {

            try {

                const response = await axios.get(url, {
                    headers: { "User-Agent": ua },
                });
                html = response.data;
                status = response.status;

                console.log("");
                console.log("✅ Site acessado com sucesso!");
                console.log("📄 Status:", status);
                console.log("📏 Tamanho HTML:", html.length, "caracteres");

                // Verifica se o conteúdo precisa de JS pra renderizar
                if (needsBrowser(html)) {

                    console.log("");
                    console.log("🔍 Conteúdo dinâmico detectado (SPA/JS)");
                    console.log("🌐 Alternando para Playwright...");

                    const rendered = await fetchWithBrowser(url, { userAgent: ua });

                    if (rendered.data) {
                        html = rendered.data;
                        usedBrowser = true;
                    }

                }

            } catch (axiosError) {

                console.log("");
                console.log("⚠️ Axios falhou:", axiosError.message);
                console.log("🌐 Tentando com Playwright...");

                const rendered = await fetchWithBrowser(url, { userAgent: ua });

                if (rendered.data) {
                    html = rendered.data;
                    status = rendered.status;
                    usedBrowser = true;
                } else {
                    throw new Error("Não foi possível acessar o site: " + rendered.error);
                }

            }

        } else {

            // ── Modo forçado: Playwright direto ─────────────────────

            console.log("");
            console.log("🌐 Modo browser forçado");

            const rendered = await fetchWithBrowser(url, { userAgent: ua });

            if (rendered.data) {
                html = rendered.data;
                status = rendered.status;
                usedBrowser = true;
            } else {
                throw new Error("Não foi possível acessar o site: " + rendered.error);
            }

        }

        if (usedBrowser) {
            console.log("🌐 Renderizado via Playwright");
        }

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

        html = rewriteHTML(html, url, "index.html");

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
            maxPages,
            delay,
            quiet
        );

        console.log("");
        console.log("✅ Total de páginas:", pages.length);

        // ── Encerrar ────────────────────────────────────────────────

        if (usedBrowser) {
            await closeBrowser();
        }

        closeLogger();

        return {
            html,
            analysis,
            pages,
            siteFolder
        };

    } catch (error) {

        await closeBrowser();
        closeLogger();

        console.log("");
        console.log("❌ Erro:");
        console.log(error.message);

        return null;

    }

}