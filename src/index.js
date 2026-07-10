import { startCrawler } from "./crawler/crawler.js";
import { saveReport } from "./reports/reporter.js";

console.clear();
console.log("======================================");
console.log("          ReactForge");
console.log("======================================");
console.log("");

const args = process.argv.slice(2);
const forceBrowser = args.includes("--browser");
const url = args.find(a => !a.startsWith("--"));

// Extrai --delay=500 ou --delay 500
let delay = 0;
const delayIndex = args.findIndex(a => a.startsWith("--delay"));
if (delayIndex !== -1) {
    const arg = args[delayIndex];
    if (arg.includes("=")) {
        delay = parseInt(arg.split("=")[1]);
    } else if (args[delayIndex + 1]) {
        delay = parseInt(args[delayIndex + 1]);
    }
}

// Extrai --max-pages=50 ou --max-pages 50
let maxPages = 20;
const maxIndex = args.findIndex(a => a.startsWith("--max-pages"));
if (maxIndex !== -1) {
    const arg = args[maxIndex];
    if (arg.includes("=")) {
        maxPages = parseInt(arg.split("=")[1]);
    } else if (args[maxIndex + 1]) {
        maxPages = parseInt(args[maxIndex + 1]);
    }
}

if (!url) {
    console.log("📌 Uso:");
    console.log("  node src/index.js https://site.com");
    console.log("");
    console.log("Opções:");
    console.log("  --browser          Forçar renderização via Playwright");
    console.log("  --delay=500        Delay entre requests em ms (padrão: 0)");
    console.log("  --max-pages=50     Máximo de páginas a clonar (padrão: 20)");
    process.exit(1);
}

console.log("🔗 URL:", url);

if (forceBrowser) {
    console.log("🌐 Modo: Playwright (forçado)");
} else {
    console.log("⚡ Modo: Automático (Axios → Playwright se necessário)");
}

if (delay > 0) {
    console.log(`⏱️ Delay: ${delay}ms entre requests`);
}

console.log(`📄 Máximo de páginas: ${maxPages}`);

const result = await startCrawler(url, { forceBrowser, delay, maxPages });

if (result) {
    saveReport(url, result.analysis);
}