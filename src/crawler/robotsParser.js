import axios from "axios";

const cache = new Map();

export async function fetchRobotsTxt(baseUrl) {

    const origin = new URL(baseUrl).origin;

    if (cache.has(origin)) {
        return cache.get(origin);
    }

    try {

        const response = await axios.get(`${origin}/robots.txt`, {
            timeout: 5000,
            headers: {
                "User-Agent": "ReactForge/1.0",
            },
        });

        const rules = parseRobotsTxt(response.data);
        cache.set(origin, rules);

        console.log("🤖 robots.txt carregado:", rules.disallowed.length, "regras");

        return rules;

    } catch {

        // Se não tem robots.txt, permite tudo
        const rules = { disallowed: [], crawlDelay: 0, sitemaps: [] };
        cache.set(origin, rules);

        console.log("🤖 robots.txt não encontrado — sem restrições");

        return rules;

    }

}

export function isAllowed(url, rules) {

    if (!rules || rules.disallowed.length === 0) {
        return true;
    }

    const pathname = new URL(url).pathname;

    for (const pattern of rules.disallowed) {

        if (pattern === "/") {
            // Disallow: / bloqueia tudo
            return false;
        }

        if (pathname.startsWith(pattern)) {
            return false;
        }

        // Suporte a wildcard básico (*)
        if (pattern.includes("*")) {
            const regex = new RegExp(
                "^" + pattern
                    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
                    .replace(/\*/g, ".*")
                + "$"
            );
            if (regex.test(pathname)) {
                return false;
            }
        }

    }

    return true;

}


// ── Parser ──────────────────────────────────────────────────────────

function parseRobotsTxt(content) {

    const rules = {
        disallowed: [],
        crawlDelay: 0,
        sitemaps: [],
    };

    if (!content) return rules;

    const lines = content.split("\n");
    let activeAgent = false;

    for (const rawLine of lines) {

        const line = rawLine.trim();

        if (!line || line.startsWith("#")) continue;

        const [directive, ...valueParts] = line.split(":");
        const key = directive.trim().toLowerCase();
        const value = valueParts.join(":").trim();

        if (key === "user-agent") {
            // Aplica regras de * (todos) ou ReactForge
            activeAgent = value === "*" || value.toLowerCase().includes("reactforge");
        }

        if (!activeAgent) continue;

        if (key === "disallow" && value) {
            rules.disallowed.push(value);
        }

        if (key === "crawl-delay" && value) {
            const delay = parseFloat(value);
            if (!isNaN(delay)) {
                rules.crawlDelay = delay * 1000; // converte pra ms
            }
        }

        if (key === "sitemap" && value) {
            rules.sitemaps.push(value);
        }

    }

    return rules;

}