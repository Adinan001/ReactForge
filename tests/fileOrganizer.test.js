import { describe, it, expect } from "vitest";
import { getAssetPath, isTrackingUrl } from "../src/crawler/fileOrganizer.js";

// Normaliza separador pra funcionar em Windows e Linux
const norm = (p) => p ? p.replace(/\\/g, "/") : p;

describe("getAssetPath", () => {

    it("CSS vai pra assets/css", () => {
        const result = norm(getAssetPath("https://example.com/style.css"));
        expect(result).toContain("assets/css");
        expect(result).toContain("style.css");
    });

    it("JS vai pra assets/js", () => {
        const result = norm(getAssetPath("https://example.com/app.js"));
        expect(result).toContain("assets/js");
    });

    it("PNG vai pra assets/images", () => {
        const result = norm(getAssetPath("https://example.com/logo.png"));
        expect(result).toContain("assets/images");
    });

    it("WOFF2 vai pra assets/fonts", () => {
        const result = norm(getAssetPath("https://example.com/font.woff2"));
        expect(result).toContain("assets/fonts");
    });

    it("JSON vai pra assets/others", () => {
        const result = norm(getAssetPath("https://example.com/manifest.json"));
        expect(result).toContain("assets/others");
    });

    it("Google Fonts CSS detectado", () => {
        const result = norm(getAssetPath("https://fonts.googleapis.com/css2?family=Roboto"));
        expect(result).toContain("assets/css");
        expect(result).toContain("Roboto");
    });

    it("Google Fonts arquivo detectado", () => {
        const result = norm(getAssetPath("https://fonts.gstatic.com/s/roboto/v30/font.woff2"));
        expect(result).toContain("assets/fonts");
    });

    it("retorna null pra tracking URL", () => {
        const result = getAssetPath("https://www.google-analytics.com/analytics.js");
        expect(result).toBeNull();
    });

});

describe("isTrackingUrl", () => {

    it("detecta Google Analytics", () => {
        expect(isTrackingUrl("https://www.google-analytics.com/collect")).toBe(true);
    });

    it("detecta Facebook pixel", () => {
        expect(isTrackingUrl("https://www.facebook.com/tr")).toBe(true);
    });

    it("detecta path /pixel", () => {
        expect(isTrackingUrl("https://example.com/pixel")).toBe(true);
    });

    it("detecta path /pxl", () => {
        expect(isTrackingUrl("https://example.com/pxl")).toBe(true);
    });

    it("não bloqueia URL normal", () => {
        expect(isTrackingUrl("https://example.com/style.css")).toBe(false);
    });

    it("não bloqueia Google Fonts", () => {
        expect(isTrackingUrl("https://fonts.googleapis.com/css2?family=Roboto")).toBe(false);
    });

});