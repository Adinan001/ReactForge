import { describe, it, expect } from "vitest";
import { resolveUrl } from "../src/crawler/urlResolver.js";

describe("resolveUrl", () => {

    it("resolve URL relativa", () => {
        const result = resolveUrl("https://example.com", "/css/style.css");
        expect(result).toBe("https://example.com/css/style.css");
    });

    it("resolve URL absoluta", () => {
        const result = resolveUrl("https://example.com", "https://cdn.example.com/lib.js");
        expect(result).toBe("https://cdn.example.com/lib.js");
    });

    it("resolve URL com path base", () => {
        const result = resolveUrl("https://example.com/docs/5.3/", "../images/logo.png");
        expect(result).toBe("https://example.com/docs/images/logo.png");
    });

    it("retorna null para target vazio", () => {
        const result = resolveUrl("https://example.com", "");
        expect(result).toBeNull();
    });

    it("retorna null para target null", () => {
        const result = resolveUrl("https://example.com", null);
        expect(result).toBeNull();
    });

    it("retorna null para URL inválida", () => {
        const result = resolveUrl("not-a-url", "also-not-valid");
        expect(result).toBeNull();
    });

});