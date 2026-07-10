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

if (!url) {
    console.log("📌 Uso:");
    console.log("  node src/index.js https://site.com");
    console.log("  node src/index.js https://site.com --browser");
    console.log("");
    console.log("Opções:");
    console.log("  --browser   Forçar renderização via Playwright");
    process.exit(1);
}

console.log("🔗 URL:", url);

if (forceBrowser) {
    console.log("🌐 Modo: Playwright (forçado)");
} else {
    console.log("⚡ Modo: Automático (Axios → Playwright se necessário)");
}

const result = await startCrawler(url, { forceBrowser });

if (result) {
    saveReport(url, result.analysis);
}