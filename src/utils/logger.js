import fs from "fs";
import path from "path";

let logFile = null;
const originalLog = console.log;

export function initLogger(siteFolder) {

    const logPath = path.join(siteFolder, "clone-log.txt");

    // Limpa log anterior
    fs.mkdirSync(siteFolder, { recursive: true });
    fs.writeFileSync(logPath, `ReactForge — Log de clonagem\n`);
    fs.appendFileSync(logPath, `Início: ${new Date().toISOString()}\n`);
    fs.appendFileSync(logPath, `${"=".repeat(50)}\n\n`);

    logFile = logPath;

    // Intercepta console.log pra salvar no arquivo também
    console.log = (...args) => {

        originalLog(...args);

        if (logFile) {

            const line = args
                .map(a => typeof a === "object" ? JSON.stringify(a) : String(a))
                .join(" ")
                // Remove caracteres de controle do progress bar
                .replace(/\r/g, "")
                .replace(/\x1b\[[0-9;]*m/g, "");

            if (line.trim()) {
                fs.appendFileSync(logFile, line + "\n");
            }

        }

    };

}

export function closeLogger() {

    if (logFile) {

        fs.appendFileSync(logFile, `\n${"=".repeat(50)}\n`);
        fs.appendFileSync(logFile, `Fim: ${new Date().toISOString()}\n`);

        originalLog(`📝 Log salvo: ${logFile}`);

        logFile = null;

    }

    // Restaura console.log original
    console.log = originalLog;

}