import { startCrawler } from "./crawler/crawler.js";
import { saveReport } from "./reports/reporter.js";

console.clear();

console.log("======================================");
console.log("          ReactForge");
console.log("======================================");
console.log("");

const url = process.argv[2];

if (!url) {

    console.log("? Uso:");
    console.log("node src/index.js https://site.com");
    process.exit(1);

}

console.log("?? URL:", url);

const result = await startCrawler(url);

if (result) {

    saveReport(url, result.analysis);

}
