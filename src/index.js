import { Command } from "commander";
import { startCrawler } from "./crawler/crawler.js";
import { saveReport } from "./reports/reporter.js";
import { exportZip } from "./export/zipExporter.js";
import { exportSingleFile } from "./export/singleFileExporter.js";
import { exportPdf } from "./export/pdfExporter.js";
import { generateCoverage, resetCoverage } from "./export/coverageReport.js";
import { analyzeBackend } from "./export/backendAnalyzer.js";
import { customizeSite } from "./customize/customizer.js";

const program = new Command();

program
    .name("reactforge")
    .description("🚀 ReactForge — Clonador de sites profissional, 100% local")
    .version("1.0.0");

// ── Comando: clone (padrão) ─────────────────────────────────────────

program
    .command("clone", { isDefault: true })
    .description("Clonar um site")
    .argument("<url>", "URL do site a ser clonado")
    .option("--browser", "Forçar renderização via Playwright", false)
    .option("--max-pages <n>", "Máximo de páginas a clonar", parseInt, 20)
    .option("--delay <ms>", "Delay entre requests em ms", parseInt, 0)
    .option("--output <dir>", "Pasta de saída (padrão: sites/)")
    .option("--user-agent <string>", "User-Agent customizado")
    .option("--quiet", "Reduzir output do terminal", false)
    .option("--zip", "Gerar ZIP do site clonado", false)
    .option("--single-file", "Gerar HTML único com tudo inline", false)
    .option("--pdf", "Gerar PDF do site clonado", false)
    .option("--coverage", "Gerar relatório de cobertura", false)
    .option("--analyze-backend", "Detectar necessidades de backend e gerar prompt", false)
    .action(async (url, options) => {

        console.clear();
        console.log("======================================");
        console.log("        ReactForge  🚀");
        console.log("======================================");
        console.log("");
        console.log("🔗 URL:", url);

        if (options.browser) {
            console.log("🌐 Modo: Playwright (forçado)");
        } else {
            console.log("⚡ Modo: Automático (Axios → Playwright se necessário)");
        }

        if (options.delay > 0) {
            console.log(`⏱️  Delay: ${options.delay}ms entre requests`);
        }

        if (options.output) {
            console.log(`📁 Saída: ${options.output}`);
        }

        if (options.userAgent) {
            console.log(`🕵️  User-Agent: ${options.userAgent}`);
        }

        console.log(`📄 Máximo de páginas: ${options.maxPages}`);

        resetCoverage();

        const result = await startCrawler(url, {
            forceBrowser: options.browser,
            delay: options.delay,
            maxPages: options.maxPages,
            quiet: options.quiet,
            output: options.output,
            userAgent: options.userAgent,
        });

        if (result) {
            saveReport(url, result.analysis);

            if (options.coverage) {
                generateCoverage(result.siteFolder, result.analysis);
            }

            if (options.analyzeBackend) {
                analyzeBackend(result.siteFolder);
            }

            if (options.zip) {
                await exportZip(result.siteFolder);
            }

            if (options.singleFile) {
                exportSingleFile(result.siteFolder);
            }

            if (options.pdf) {
                await exportPdf(result.siteFolder);
            }
        }

    });

// ── Comando: customize ──────────────────────────────────────────────

program
    .command("customize")
    .description("Personalizar um site clonado (textos, cores, contatos)")
    .argument("<folder>", "Pasta do site clonado (ex: sites/fgp-adv.vercel.app)")
    .action(async (folder) => {

        console.clear();
        console.log("======================================");
        console.log("        ReactForge  🎨");
        console.log("======================================");

        await customizeSite(folder);

    });

program.parse();