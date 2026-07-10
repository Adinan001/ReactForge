import { Command } from "commander";
import { startCrawler } from "./crawler/crawler.js";
import { saveReport } from "./reports/reporter.js";
import { exportZip } from "./export/zipExporter.js";

const program = new Command();

program
    .name("reactforge")
    .description("🚀 ReactForge — Clonador de sites profissional, 100% local")
    .version("1.0.0")
    .argument("<url>", "URL do site a ser clonado")
    .option("--browser", "Forçar renderização via Playwright", false)
    .option("--max-pages <n>", "Máximo de páginas a clonar", parseInt, 20)
    .option("--delay <ms>", "Delay entre requests em ms", parseInt, 0)
    .option("--quiet", "Reduzir output do terminal", false)
    .option("--zip", "Gerar ZIP do site clonado", false)
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

        console.log(`📄 Máximo de páginas: ${options.maxPages}`);

        const result = await startCrawler(url, {
            forceBrowser: options.browser,
            delay: options.delay,
            maxPages: options.maxPages,
            quiet: options.quiet,
        });

        if (result) {
            saveReport(url, result.analysis);

            if (options.zip) {
                await exportZip(result.siteFolder);
            }
        }

    });

program.parse();