import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

export function analyzeBackend(siteFolder) {

    const indexPath = path.join(siteFolder, "index.html");

    if (!fs.existsSync(indexPath)) {
        console.log("⚠️ index.html não encontrado em", siteFolder);
        return null;
    }

    // Coleta todos os HTMLs do site
    const htmlFiles = findHtmlFiles(siteFolder);
    
    const spec = {
        forms: [],
        auth: false,
        apis: [],
        integrations: [],
        dynamicSections: [],
        externalServices: [],
    };

    for (const file of htmlFiles) {

        const html = fs.readFileSync(file, "utf8");
        const $ = cheerio.load(html);
        const pagePath = path.relative(siteFolder, file);

        // ── Formulários ─────────────────────────────────────────────

        $("form").each((_, el) => {

            const fields = [];

            $(el).find("input, textarea, select").each((_, field) => {
                const name = $(field).attr("name") || $(field).attr("id") || "";
                const type = $(field).attr("type") || $(field).prop("tagName").toLowerCase();
                const placeholder = $(field).attr("placeholder") || "";
                const required = $(field).attr("required") !== undefined;

                if (name && type !== "hidden" && type !== "submit") {
                    fields.push({ name, type, placeholder, required });
                }
            });

            const action = $(el).attr("action") || "";
            const method = ($(el).attr("method") || "GET").toUpperCase();

            // Detecta tipo de formulário
            const formType = detectFormType(fields, action, $, el);

            spec.forms.push({
                type: formType,
                action,
                method,
                fields,
                page: pagePath,
            });

        });

        // ── Autenticação ────────────────────────────────────────────

        const authSignals = [
            "login", "signin", "sign-in", "log-in",
            "register", "signup", "sign-up",
            "forgot-password", "reset-password",
            "minha-conta", "my-account", "dashboard",
            "logout", "signout",
        ];

        const bodyText = $("body").text().toLowerCase();
        const bodyHtml = $("body").html()?.toLowerCase() || "";

        for (const signal of authSignals) {
            if (bodyHtml.includes(signal)) {
                spec.auth = true;
                break;
            }
        }

        // ── APIs detectadas ─────────────────────────────────────────

        $("script").each((_, el) => {

            const scriptContent = $(el).html() || "";

            // Detecta fetch/axios calls
            const apiRegex = /(?:fetch|axios\.(?:get|post|put|delete|patch))\s*\(\s*['"`]([^'"`]+)['"`]/g;
            let match;

            while ((match = apiRegex.exec(scriptContent)) !== null) {
                const apiUrl = match[1];
                if (apiUrl.startsWith("/api") || apiUrl.startsWith("http")) {
                    if (!spec.apis.includes(apiUrl)) {
                        spec.apis.push(apiUrl);
                    }
                }
            }

        });

        // ── Integrações ─────────────────────────────────────────────

        // WhatsApp
        $('a[href*="wa.me"], a[href*="whatsapp"]').each(() => {
            if (!spec.integrations.includes("whatsapp")) {
                spec.integrations.push("whatsapp");
            }
        });

        // Google Maps
        $('iframe[src*="google.com/maps"], iframe[src*="maps.google"]').each(() => {
            if (!spec.integrations.includes("google-maps")) {
                spec.integrations.push("google-maps");
            }
        });

        // YouTube
        $('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').each(() => {
            if (!spec.integrations.includes("youtube")) {
                spec.integrations.push("youtube");
            }
        });

        // Chat widgets
        const chatSignals = ["tawk.to", "intercom", "crisp", "zendesk", "drift", "livechat", "tidio"];
        for (const chat of chatSignals) {
            if (bodyHtml.includes(chat)) {
                if (!spec.integrations.includes(`chat-${chat}`)) {
                    spec.integrations.push(`chat-${chat}`);
                }
            }
        }

        // Pagamento
        const paymentSignals = ["stripe", "paypal", "mercadopago", "pagseguro", "pagar.me"];
        for (const payment of paymentSignals) {
            if (bodyHtml.includes(payment)) {
                if (!spec.integrations.includes(`payment-${payment}`)) {
                    spec.integrations.push(`payment-${payment}`);
                }
            }
        }

        // ── Seções dinâmicas ────────────────────────────────────────

        const dynamicSignals = [
            { selector: '[data-page], [data-per-page], .pagination', type: "pagination" },
            { selector: '.product-list, .product-grid, [data-product]', type: "product-listing" },
            { selector: '.blog-posts, .post-list, article.post', type: "blog-listing" },
            { selector: '.cart, .shopping-cart, [data-cart]', type: "shopping-cart" },
            { selector: '.filter, .search-filter, [data-filter]', type: "filters" },
            { selector: '.comments, .comment-list, [data-comments]', type: "comments" },
        ];

        for (const signal of dynamicSignals) {
            if ($(signal.selector).length > 0) {
                if (!spec.dynamicSections.includes(signal.type)) {
                    spec.dynamicSections.push(signal.type);
                }
            }
        }

        // ── Serviços externos ───────────────────────────────────────

        $('script[src]').each((_, el) => {
            const src = $(el).attr("src") || "";
            if (src.includes("analytics")) spec.externalServices.push("analytics");
            if (src.includes("gtag") || src.includes("googletagmanager")) spec.externalServices.push("google-tag-manager");
            if (src.includes("hotjar")) spec.externalServices.push("hotjar");
            if (src.includes("pixel") || src.includes("fbevents")) spec.externalServices.push("facebook-pixel");
        });

    }

    // Deduplica serviços externos
    spec.externalServices = [...new Set(spec.externalServices)];

    // ── Salvar spec ─────────────────────────────────────────────────

    const specPath = path.join(siteFolder, "backend-spec.json");
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    // ── Gerar prompt.md ─────────────────────────────────────────────

    const promptPath = path.join(siteFolder, "prompt.md");
    fs.writeFileSync(promptPath, generatePrompt(spec, siteFolder));

    // ── Log ─────────────────────────────────────────────────────────

    console.log("");
    console.log("🔍 Análise de Backend");
    console.log(`   Formulários: ${spec.forms.length}`);
    console.log(`   Autenticação: ${spec.auth ? "Sim" : "Não"}`);
    console.log(`   APIs detectadas: ${spec.apis.length}`);
    console.log(`   Integrações: ${spec.integrations.length}`);
    console.log(`   Seções dinâmicas: ${spec.dynamicSections.length}`);
    console.log(`   Serviços externos: ${spec.externalServices.length}`);
    console.log("");
    console.log(`   📄 Spec: ${specPath}`);
    console.log(`   📝 Prompt: ${promptPath}`);

    return spec;

}


// ── Helpers ─────────────────────────────────────────────────────────

function detectFormType(fields, action, $, el) {

    const fieldNames = fields.map(f => f.name.toLowerCase()).join(" ");
    const fieldTypes = fields.map(f => f.type.toLowerCase()).join(" ");

    if (fieldTypes.includes("password") || fieldNames.includes("password")) {
        if (fieldNames.includes("confirm") || fieldNames.includes("register")) return "register";
        return "login";
    }

    if (fieldNames.includes("email") && fields.length === 1) return "newsletter";

    if (fieldNames.includes("message") || fieldNames.includes("mensagem") ||
        fieldNames.includes("subject") || fieldNames.includes("assunto")) return "contact";

    if (fieldNames.includes("search") || fieldNames.includes("busca") ||
        fieldNames.includes("query") || fieldNames.includes("q")) return "search";

    if (action.includes("subscribe") || action.includes("newsletter")) return "newsletter";

    return "unknown";

}

function findHtmlFiles(dir) {

    const files = [];

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {

        const fullPath = path.join(dir, item.name);

        if (item.isDirectory() && item.name !== "assets") {
            files.push(...findHtmlFiles(fullPath));
        } else if (item.name.endsWith(".html")) {
            files.push(fullPath);
        }

    }

    return files;

}

function generatePrompt(spec, siteFolder) {

    const siteName = path.basename(siteFolder);
    let prompt = `# Backend para ${siteName}\n\n`;
    prompt += `Tenho um site clonado que precisa de backend. Analise a especificação abaixo e gere o código necessário.\n\n`;

    // Formulários
    if (spec.forms.length > 0) {
        prompt += `## Formulários detectados\n\n`;
        for (const form of spec.forms) {
            prompt += `### ${form.type} (${form.method} ${form.action || "sem action"})\n`;
            prompt += `Página: ${form.page}\n`;
            prompt += `Campos:\n`;
            for (const field of form.fields) {
                prompt += `- ${field.name} (${field.type})${field.required ? " — obrigatório" : ""}\n`;
            }
            prompt += `\n`;
        }
    }

    // Auth
    if (spec.auth) {
        prompt += `## Autenticação\n`;
        prompt += `O site possui elementos de autenticação (login/registro). Implemente:\n`;
        prompt += `- Registro de usuário\n`;
        prompt += `- Login com email/senha\n`;
        prompt += `- Recuperação de senha\n`;
        prompt += `- Proteção de rotas autenticadas\n\n`;
    }

    // APIs
    if (spec.apis.length > 0) {
        prompt += `## APIs detectadas\n\n`;
        for (const api of spec.apis) {
            prompt += `- \`${api}\`\n`;
        }
        prompt += `\nCrie as rotas correspondentes no backend.\n\n`;
    }

    // Integrações
    if (spec.integrations.length > 0) {
        prompt += `## Integrações\n\n`;
        for (const integration of spec.integrations) {
            prompt += `- ${integration}\n`;
        }
        prompt += `\n`;
    }

    // Seções dinâmicas
    if (spec.dynamicSections.length > 0) {
        prompt += `## Seções dinâmicas\n\n`;
        prompt += `Estas seções precisam de dados do backend:\n`;
        for (const section of spec.dynamicSections) {
            prompt += `- ${section}\n`;
        }
        prompt += `\n`;
    }

    // Instruções finais
    prompt += `## Instruções\n\n`;
    prompt += `Gere o backend usando a stack de sua preferência. Sugestões:\n`;
    prompt += `- Node.js + Express + Supabase\n`;
    prompt += `- Node.js + Fastify + PostgreSQL\n`;
    prompt += `- Python + FastAPI + SQLite\n\n`;
    prompt += `Inclua:\n`;
    prompt += `- Estrutura de pastas do backend\n`;
    prompt += `- Models/schemas para banco de dados\n`;
    prompt += `- Rotas/controllers para cada formulário e API\n`;
    prompt += `- Arquivo .env com variáveis necessárias\n`;
    prompt += `- Instruções de instalação e execução\n`;

    return prompt;

}