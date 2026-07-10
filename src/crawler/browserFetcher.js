import { chromium } from "playwright";

let browser = null;

export async function launchBrowser() {

    if (browser) return browser;

    console.log("");
    console.log("🌐 Iniciando navegador...");

    browser = await chromium.launch({
        headless: true,
    });

    console.log("✅ Navegador pronto");

    return browser;

}

export async function closeBrowser() {

    if (browser) {
        await browser.close();
        browser = null;
        console.log("🌐 Navegador encerrado");
    }

}

export async function fetchWithBrowser(url, options = {}) {

    const {
        waitFor = "networkidle",
        timeout = 30000,
        scrollToBottom = true,
    } = options;

    const b = await launchBrowser();
    const context = await b.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    try {

        console.log("🌐 Renderizando:", url);

        await page.goto(url, {
            waitUntil: waitFor,
            timeout,
        });

        // Scroll pra disparar lazy loading
        if (scrollToBottom) {
            await autoScroll(page);
        }

        // Espera um pouco pra JS terminar de renderizar
        await page.waitForTimeout(1000);

        const html = await page.content();

        console.log("✅ Página renderizada:", html.length, "caracteres");

        return {
            data: html,
            status: 200,
            rendered: true,
        };

    } catch (error) {

        console.log("⚠️ Erro no navegador:", error.message);

        return {
            data: null,
            status: 0,
            rendered: false,
            error: error.message,
        };

    } finally {

        await context.close();

    }

}

export function needsBrowser(html) {

    if (!html || html.trim().length === 0) return true;

    // HTML muito pequeno geralmente indica SPA sem renderização
    if (html.length < 500) return true;

    // Detecta frameworks SPA comuns
    const spaSignals = [
        '<div id="root"></div>',
        '<div id="root">',
        '<div id="app"></div>',
        '<div id="app">',
        '<div id="__next"></div>',
        '<div id="__next">',
        '<div id="__nuxt"></div>',
        '<div id="__nuxt">',
        "noscript",
        "window.__INITIAL_STATE__",
        "window.__NEXT_DATA__",
    ];

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1].trim() : "";

    // Se o body tem pouco conteúdo mas muitos scripts, é SPA
    if (bodyContent.length < 200) {
        const scriptCount = (html.match(/<script/gi) || []).length;
        if (scriptCount >= 2) return true;
    }

    for (const signal of spaSignals) {
        if (html.includes(signal)) return true;
    }

    return false;

}


// ── Helper ──────────────────────────────────────────────────────────

async function autoScroll(page) {

    await page.evaluate(async () => {

        await new Promise((resolve) => {

            let totalHeight = 0;
            const distance = 300;
            const maxScrolls = 20;
            let scrolls = 0;

            const timer = setInterval(() => {

                window.scrollBy(0, distance);
                totalHeight += distance;
                scrolls++;

                if (
                    totalHeight >= document.body.scrollHeight ||
                    scrolls >= maxScrolls
                ) {
                    clearInterval(timer);
                    window.scrollTo(0, 0);
                    resolve();
                }

            }, 100);

        });

    });

}