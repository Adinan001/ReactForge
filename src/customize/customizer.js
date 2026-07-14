import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import * as cheerio from "cheerio";

// ── Paleta de cores ─────────────────────────────────────────────────

const COLOR_FAMILIES = {
    "Vermelho":  { claro: "#ff6b6b", medio: "#e63946", escuro: "#c1121f", profundo: "#780000" },
    "Azul":      { claro: "#74b9ff", medio: "#0984e3", escuro: "#0652DD", profundo: "#1B1464" },
    "Verde":     { claro: "#55efc4", medio: "#00b894", escuro: "#00805a", profundo: "#004d40" },
    "Dourado":   { claro: "#ffd700", medio: "#c9a84c", escuro: "#b8860b", profundo: "#8B6914" },
    "Roxo":      { claro: "#a29bfe", medio: "#6c5ce7", escuro: "#5f27cd", profundo: "#341f97" },
    "Laranja":   { claro: "#ffa502", medio: "#e17055", escuro: "#d63031", profundo: "#b33939" },
    "Rosa":      { claro: "#fd79a8", medio: "#e84393", escuro: "#c44569", profundo: "#833471" },
    "Cinza":     { claro: "#b2bec3", medio: "#636e72", escuro: "#2d3436", profundo: "#1e272e" },
};

const TONE_LABELS = {
    claro: "Claro",
    medio: "Médio",
    escuro: "Escuro",
    profundo: "Profundo",
};

// ── Entry point ─────────────────────────────────────────────────────

export async function customizeSite(siteFolder) {

    if (!fs.existsSync(siteFolder)) {
        console.log("⚠️ Pasta não encontrada:", siteFolder);
        return;
    }

    const indexPath = path.join(siteFolder, "index.html");

    if (!fs.existsSync(indexPath)) {
        console.log("⚠️ index.html não encontrado em", siteFolder);
        return;
    }

    console.log("");
    console.log("🎨 ReactForge — Personalização");
    console.log(`   Site: ${path.basename(siteFolder)}`);
    console.log("");

    const html = fs.readFileSync(indexPath, "utf8");
    const $ = cheerio.load(html);

    // Detecta valores atuais
    const currentTitle = $("title").first().text().trim() || "";
    const currentH1 = $("h1").first().text().trim() || "";
    const currentWhatsapp = detectWhatsapp($);
    const currentEmail = detectEmail($);
    const currentPhone = detectPhone($);

    // ── Perguntas ───────────────────────────────────────────────────

    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: `📝 Nome/Título do site [${currentH1 || currentTitle}]:`,
            default: currentH1 || currentTitle,
        },
        {
            type: "input",
            name: "whatsapp",
            message: `📱 WhatsApp [${currentWhatsapp || "nenhum"}]:`,
            default: currentWhatsapp || "",
        },
        {
            type: "input",
            name: "email",
            message: `📧 Email [${currentEmail || "nenhum"}]:`,
            default: currentEmail || "",
        },
        {
            type: "input",
            name: "phone",
            message: `📞 Telefone [${currentPhone || "nenhum"}]:`,
            default: currentPhone || "",
        },
        {
            type: "confirm",
            name: "changeColors",
            message: "🎨 Deseja alterar cores?",
            default: false,
        },
    ]);

    // ── Aplicar mudanças via cheerio (whatsapp, email, phone) ────────

    const changes = [];
    const oldName = currentH1 || currentTitle;
    const newName = answers.title;
    const nameChanged = newName !== oldName;

    if (nameChanged) {
        changes.push(`Título: ${newName}`);
    }

    if (answers.whatsapp && answers.whatsapp !== currentWhatsapp) {

        applyWhatsapp($, answers.whatsapp);
        changes.push(`WhatsApp: ${answers.whatsapp}`);

    }

    if (answers.email && answers.email !== currentEmail) {

        applyEmail($, answers.email);
        changes.push(`Email: ${answers.email}`);

    }

    if (answers.phone && answers.phone !== currentPhone) {

        applyPhone($, answers.phone);
        changes.push(`Telefone: ${answers.phone}`);

    }

    // ── Cores ───────────────────────────────────────────────────────

    if (answers.changeColors) {

        const detectedColors = detectColors(siteFolder);

        if (detectedColors.length === 0) {

            console.log("⚠️ Nenhuma cor detectada nos arquivos CSS");

        } else {

            console.log("");
            console.log("🎨 Cores detectadas no site:");

            const colorChoices = detectedColors.map((c, i) => ({
                name: `  ${i + 1}. ${c.hex} (${c.name}) — ${c.count}x usado`,
                value: i,
            }));

            const { colorIndex } = await inquirer.prompt([
                {
                    type: "select",
                    name: "colorIndex",
                    message: "Qual cor quer trocar?",
                    choices: colorChoices,
                },
            ]);

            const oldColor = detectedColors[colorIndex].hex;

            // Escolher família de cor
            const familyChoices = Object.keys(COLOR_FAMILIES).map(name => ({
                name,
                value: name,
            }));
            familyChoices.push({ name: "Outro (código hex)", value: "custom" });

            const { family } = await inquirer.prompt([
                {
                    type: "select",
                    name: "family",
                    message: "🎨 Escolha a nova cor:",
                    choices: familyChoices,
                },
            ]);

            let newColor;

            if (family === "custom") {

                const { hex } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "hex",
                        message: "Digite o código hex (ex: #ff0000):",
                        validate: (v) => /^#[0-9a-fA-F]{6}$/.test(v) || "Formato inválido. Use #RRGGBB",
                    },
                ]);

                newColor = hex;

            } else {

                const tones = COLOR_FAMILIES[family];
                const toneChoices = Object.entries(tones).map(([key, hex]) => ({
                    name: `  ${TONE_LABELS[key].padEnd(10)} ${hex}`,
                    value: hex,
                }));

                const { tone } = await inquirer.prompt([
                    {
                        type: "select",
                        name: "tone",
                        message: "🎨 Tonalidade:",
                        choices: toneChoices,
                    },
                ]);

                newColor = tone;

            }

            applyColorChange(siteFolder, oldColor, newColor);
            changes.push(`Cor: ${oldColor} → ${newColor}`);

        }

    }

    // ── Salvar HTML (cheerio: whatsapp, email, phone) ───────────────

    fs.writeFileSync(indexPath, $.html());

    // ── Aplicar troca de nome DEPOIS do cheerio ─────────────────────

    if (nameChanged) {
        applyTextChanges(siteFolder, oldName, newName);
    }

    // ── Resumo ──────────────────────────────────────────────────────

    console.log("");

    if (changes.length > 0) {
        console.log("✅ Site personalizado com sucesso!");
        for (const change of changes) {
            console.log(`   ✔ ${change}`);
        }
    } else {
        console.log("ℹ️ Nenhuma alteração feita.");
    }

    console.log("");
    console.log(`   Abra ${indexPath} pra conferir.`);

}


// ── Detectores ──────────────────────────────────────────────────────

function detectWhatsapp($) {

    let number = "";

    $('a[href*="wa.me"], a[href*="whatsapp"]').each((_, el) => {
        const href = $(el).attr("href") || "";
        const match = href.match(/(\d{10,15})/);
        if (match) number = match[1];
    });

    return number;

}

function detectEmail($) {

    let email = "";

    $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr("href") || "";
        email = href.replace("mailto:", "").split("?")[0];
    });

    return email;

}

function detectPhone($) {

    let phone = "";

    $('a[href^="tel:"]').each((_, el) => {
        const href = $(el).attr("href") || "";
        phone = href.replace("tel:", "");
    });

    return phone;

}

function detectColors(siteFolder) {

    const cssDir = path.join(siteFolder, "assets", "css");

    if (!fs.existsSync(cssDir)) return [];

    const colorCount = {};

    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith(".css"));

    for (const file of cssFiles) {

        const css = fs.readFileSync(path.join(cssDir, file), "utf8");
        const hexRegex = /#[0-9a-fA-F]{6}\b/g;
        let match;

        while ((match = hexRegex.exec(css)) !== null) {
            const hex = match[0].toLowerCase();
            colorCount[hex] = (colorCount[hex] || 0) + 1;
        }

    }

    // Ordena por frequência e pega top 10
    return Object.entries(colorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([hex, count]) => ({
            hex,
            count,
            name: getColorName(hex),
        }));

}

function getColorName(hex) {

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (r > 200 && g < 100 && b < 100) return "vermelho";
    if (r < 100 && g > 200 && b < 100) return "verde";
    if (r < 100 && g < 100 && b > 200) return "azul";
    if (r > 200 && g > 200 && b < 100) return "amarelo/dourado";
    if (r > 200 && g > 100 && b < 100) return "laranja";
    if (r > 150 && g < 100 && b > 150) return "roxo";
    if (r > 200 && g < 150 && b > 150) return "rosa";
    if (r > 200 && g > 200 && b > 200) return "branco/claro";
    if (r < 50 && g < 50 && b < 50) return "preto/escuro";
    if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) return "cinza";

    return "misto";

}


// ── Aplicadores ─────────────────────────────────────────────────────

function applyTextChanges(siteFolder, oldText, newText) {

    const htmlFiles = findHtmlFiles(siteFolder);

    for (const file of htmlFiles) {

        let content = fs.readFileSync(file, "utf8");
        const escaped = oldText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "g");

        const newContent = content.replace(regex, newText);

        if (newContent !== content) {
            fs.writeFileSync(file, newContent);
        }

    }

}

function applyWhatsapp($, number) {

    const clean = number.replace(/\D/g, "");

    $('a[href*="wa.me"], a[href*="whatsapp"]').each((_, el) => {
        const href = $(el).attr("href") || "";
        const newHref = href.replace(/\d{10,15}/, clean);
        $(el).attr("href", newHref);
    });

}

function applyEmail($, email) {

    $('a[href^="mailto:"]').each((_, el) => {
        $(el).attr("href", `mailto:${email}`);
        const text = $(el).text();
        if (text.includes("@")) {
            $(el).text(email);
        }
    });

}

function applyPhone($, phone) {

    const clean = phone.replace(/\D/g, "");

    $('a[href^="tel:"]').each((_, el) => {
        $(el).attr("href", `tel:${clean}`);
        const text = $(el).text();
        if (/[\d\(\)\-\s]{8,}/.test(text)) {
            $(el).text(phone);
        }
    });

}

function applyColorChange(siteFolder, oldColor, newColor) {

    const cssDir = path.join(siteFolder, "assets", "css");

    if (!fs.existsSync(cssDir)) return;

    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith(".css"));
    let totalChanges = 0;

    for (const file of cssFiles) {

        const filePath = path.join(cssDir, file);
        let css = fs.readFileSync(filePath, "utf8");

        const regex = new RegExp(oldColor.replace("#", "\\#"), "gi");
        const matches = css.match(regex);

        if (matches) {
            css = css.replace(regex, newColor);
            fs.writeFileSync(filePath, css);
            totalChanges += matches.length;
        }

    }

    // Troca também em inline styles no HTML
    const htmlFiles = findHtmlFiles(siteFolder);

    for (const file of htmlFiles) {

        let html = fs.readFileSync(file, "utf8");
        const regex = new RegExp(oldColor.replace("#", "\\#"), "gi");

        if (regex.test(html)) {
            html = html.replace(regex, newColor);
            fs.writeFileSync(file, html);
        }

    }

    console.log(`   Substituiu ${totalChanges} ocorrências nos CSS`);

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