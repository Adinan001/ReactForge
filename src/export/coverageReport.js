import fs from "fs";
import path from "path";

const downloaded = [];
const failed = [];

export function trackDownload(url, destination, success) {

    if (success) {
        downloaded.push({ url, destination });
    } else {
        failed.push({ url, destination });
    }

}

export function generateCoverage(siteFolder, analysis) {

    const total = downloaded.length + failed.length;
    const percent = total > 0 ? ((downloaded.length / total) * 100).toFixed(1) : 0;

    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total,
            downloaded: downloaded.length,
            failed: failed.length,
            coverage: `${percent}%`,
        },
        analysis: {
            title: analysis.title,
            links: analysis.summary.links,
            css: analysis.summary.css,
            scripts: analysis.summary.scripts,
            images: analysis.summary.images,
        },
        downloaded: downloaded.map(d => ({
            url: d.url,
            file: path.relative(siteFolder, d.destination),
        })),
        failed: failed.map(f => ({
            url: f.url,
            file: f.destination ? path.relative(siteFolder, f.destination) : null,
        })),
    };

    const reportPath = path.join(siteFolder, "coverage-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // ── Log ─────────────────────────────────────────────────────────

    console.log("");
    console.log("📊 Relatório de Cobertura");
    console.log(`   Total de recursos: ${total}`);
    console.log(`   Baixados: ${downloaded.length} ✅`);
    console.log(`   Falhou: ${failed.length} ❌`);
    console.log(`   Cobertura: ${percent}%`);

    if (failed.length > 0) {
        console.log("");
        console.log("   Recursos que falharam:");
        for (const f of failed.slice(0, 10)) {
            console.log(`     ❌ ${f.url}`);
        }
        if (failed.length > 10) {
            console.log(`     ... e mais ${failed.length - 10}`);
        }
    }

    console.log(`   Relatório salvo: ${reportPath}`);

    return report;

}

export function resetCoverage() {

    downloaded.length = 0;
    failed.length = 0;

}