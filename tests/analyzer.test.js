import { describe, it, expect } from "vitest";
import { analyzeHTML } from "../src/crawler/analyzer.js";

const sampleHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Meu Site</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="manifest" href="/manifest.json">
    <meta property="og:title" content="Meu Site">
    <meta property="og:image" content="https://example.com/image.png">
    <script src="/js/app.js"></script>
</head>
<body>
    <img src="/images/logo.png">
    <img src="/images/hero.jpg" srcset="/images/hero-2x.jpg 2x, /images/hero-3x.jpg 3x">
    <a href="/about">Sobre</a>
    <a href="/contact">Contato</a>
</body>
</html>
`;

describe("analyzeHTML", () => {

    const result = analyzeHTML(sampleHTML);

    it("extrai título limpo", () => {
        expect(result.title).toBe("Meu Site");
    });

    it("encontra CSS", () => {
        expect(result.css).toContain("/css/style.css");
        expect(result.css.length).toBe(1);
    });

    it("encontra scripts", () => {
        expect(result.scripts).toContain("/js/app.js");
        expect(result.scripts.length).toBe(1);
    });

    it("encontra imagens incluindo srcset", () => {
        expect(result.images).toContain("/images/logo.png");
        expect(result.images).toContain("/images/hero.jpg");
        expect(result.images).toContain("/images/hero-2x.jpg");
        expect(result.images).toContain("/images/hero-3x.jpg");
    });

    it("encontra links", () => {
        expect(result.links).toContain("/about");
        expect(result.links).toContain("/contact");
    });

    it("retorna summary com contagens", () => {
        expect(result.summary.css).toBe(1);
        expect(result.summary.scripts).toBe(1);
        expect(result.summary.links).toBe(2);
    });

    it("detecta favicons", () => {
        expect(result.resources.favicons.length).toBe(1);
        expect(result.resources.favicons[0].href).toBe("/favicon.ico");
    });

    it("detecta manifest", () => {
        expect(result.resources.manifest).not.toBeNull();
        expect(result.resources.manifest.href).toBe("/manifest.json");
    });

    it("detecta Open Graph", () => {
        expect(result.resources.openGraph).not.toBeNull();
        expect(result.resources.openGraph.title).toBe("Meu Site");
    });

});

describe("analyzeHTML com HTML vazio", () => {

    it("retorna título padrão", () => {
        const result = analyzeHTML("<html><head></head><body></body></html>");
        expect(result.title).toBe("Não encontrado");
    });

    it("retorna arrays vazios", () => {
        const result = analyzeHTML("<html><head></head><body></body></html>");
        expect(result.css.length).toBe(0);
        expect(result.scripts.length).toBe(0);
        expect(result.images.length).toBe(0);
        expect(result.links.length).toBe(0);
    });

});