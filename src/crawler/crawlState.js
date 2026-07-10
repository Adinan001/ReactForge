import fs from "fs";
import path from "path";

const STATE_FILE = "crawl-state.json";

export function saveState(siteFolder, visited, queue) {

    const statePath = path.join(siteFolder, STATE_FILE);

    const state = {
        timestamp: new Date().toISOString(),
        visited: [...visited],
        queue: [...queue],
        totalVisited: visited.size,
        totalQueue: queue.length,
    };

    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

}

export function loadState(siteFolder) {

    const statePath = path.join(siteFolder, STATE_FILE);

    if (!fs.existsSync(statePath)) {
        return null;
    }

    try {

        const data = JSON.parse(fs.readFileSync(statePath, "utf8"));

        console.log("");
        console.log("🔄 Crawl anterior encontrado!");
        console.log(`   Páginas visitadas: ${data.totalVisited}`);
        console.log(`   Páginas na fila: ${data.totalQueue}`);
        console.log(`   Salvo em: ${data.timestamp}`);

        return {
            visited: new Set(data.visited),
            queue: data.queue,
        };

    } catch {

        return null;

    }

}

export function clearState(siteFolder) {

    const statePath = path.join(siteFolder, STATE_FILE);

    if (fs.existsSync(statePath)) {
        fs.unlinkSync(statePath);
    }

}
