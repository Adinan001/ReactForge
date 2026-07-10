import fs from "fs";
import path from "path";

export async function exportZip(siteFolder) {

    const siteName = path.basename(siteFolder);
    const zipPath = path.join(siteFolder, "..", `${siteName}.zip`);

    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip();

    zip.addLocalFolder(siteFolder, siteName);
    zip.writeZip(zipPath);

    const stats = fs.statSync(zipPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log("");
    console.log(`📦 ZIP criado: ${zipPath}`);
    console.log(`   Tamanho: ${sizeMB} MB`);

    return zipPath;

}