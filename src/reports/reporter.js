import fs from "fs";

export function saveReport(url, analysis) {

    const report = {
        url,
        ...analysis,
        createdAt: new Date().toISOString()
    };

    fs.writeFileSync(
        "report.json",
        JSON.stringify(report, null, 4),
        "utf8"
    );

    console.log("");
    console.log("💾 Relatório salvo: report.json");
}