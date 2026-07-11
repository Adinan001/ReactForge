import fs from "fs";
import path from "path";
import { chromium } from "playwright";

export async function exportPdf(siteFolder) {

    const indexPath = path.join(siteFolder, "index.html");

    if (!fs.existsSync(indexPath)) {
        console.log("⚠️ index.html não encontrado em", siteFolder);
        return null;
    }

    const siteName = path.basename(siteFolder);
    const pdfPath = path.join(siteFolder, "..", `${siteName}.pdf`);

    const absolutePath = path.resolve(indexPath);
    const fileUrl = `file:///${absolutePath.replace(/\\/g, "/")}`;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {

        console.log("");
        console.log("📸 Gerando PDF...");

        await page.goto(fileUrl, { waitUntil: "networkidle" });

        await page.pdf({
            path: pdfPath,
            format: "A4",
            printBackground: true,
            margin: {
                top: "10mm",
                bottom: "10mm",
                left: "10mm",
                right: "10mm",
            },
        });

        const sizeMB = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(2);

        console.log(`📄 PDF criado: ${pdfPath}`);
        console.log(`   Tamanho: ${sizeMB} MB`);

        return pdfPath;

    } catch (error) {

        console.log("⚠️ Erro ao gerar PDF:", error.message);
        return null;

    } finally {

        await browser.close();

    }

}