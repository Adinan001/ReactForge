![Tests]
(https://github.com/Adinan001/ReactForge/actions/workflows/test.yml/badge.svg)

# ReactForge 🚀

Clonador de sites profissional desenvolvido em **Node.js** — 100% local, sem consumo de tokens ou APIs externas.

O ReactForge acessa uma página web, analisa sua estrutura completa, baixa todos os recursos (CSS, JS, imagens, favicons, fonts, manifest) e reconstrói o site localmente com reescrita automática de caminhos para funcionamento offline.

> **Por que ReactForge?** Clonadores baseados em IA (Claude Code + Playwright MCP) consomem centenas de milhares de tokens por execução. O ReactForge inverte essa lógica: o motor roda localmente sem custo, quantas vezes quiser.

---

## ✨ Funcionalidades

### Análise HTML
- Extração limpa de título, links, CSS, scripts e imagens
- Detecção de imagens responsivas via `srcset` e `<picture><source>`
- Deduplicação automática de URLs

### Detecção de Recursos Especiais
- Favicons (icon, apple-touch-icon, mask-icon) com tamanhos
- manifest.json
- Preload / Prefetch / DNS-Prefetch / Preconnect / Modulepreload
- Vídeos e Áudios
- Iframes (incluindo lazy loading via `data-src`)
- Fontes (preload + `@font-face` inline)
- Meta tags completas (charset, description, viewport)
- Open Graph + Twitter Cards
- JSON-LD (Schema.org)
- Links SEO (canonical, alternate, hreflang)
- Paginação (prev/next)

### Download Inteligente
- Downloads paralelos (5 simultâneos) com retry e backoff exponencial
- Organização automática por tipo (`assets/css`, `assets/js`, `assets/images`, `assets/fonts`)
- Cache de downloads para evitar duplicatas
- Filtro automático de tracking pixels e analytics (40+ hosts bloqueados)
- Suporte a Google Fonts e Adobe Fonts
- Respeito a robots.txt com crawl-delay

### Reescrita de URLs para Offline
- Atributos: `src`, `href`, `poster`, `data-src`, `data-lazy`, `background`
- Tags: `link`, `script`, `img`, `source`, `video`, `audio`, `iframe`, `object`, `embed`
- `srcset` completo com descriptors preservados
- Inline styles e tags `<style>` com `url()`
- URLs dentro de arquivos CSS (background-image, @font-face, @import)
- Meta tags Open Graph e Twitter Cards
- Caminhos relativos calculados por profundidade da página
- Remoção automática de `integrity` e `crossorigin`

### Playwright (Sites Dinâmicos)
- Detecção automática de SPAs (React, Vue, Next.js, Nuxt)
- Fallback inteligente: Axios → Playwright quando necessário
- Flag `--browser` para forçar renderização via navegador
- Auto-scroll para capturar conteúdo com lazy loading
- Wait for network idle

### Crawler Multi-Página
- Varredura automática de links internos
- Deduplicação de URLs com normalização de trailing slash
- Limite configurável de páginas (`--max-pages`)
- Estrutura de diretórios espelhando o path original do site
- Resumo de crawl interrompido (retoma automaticamente)

### Relatórios
- Relatório JSON com análise completa
- Log detalhado no terminal com seções organizadas

---

## 🛠️ Tecnologias

- **Node.js** — Runtime
- **JavaScript ES Modules** — Arquitetura modular
- **Axios** — Requisições HTTP
- **Cheerio** — Parser HTML
- **Playwright** — Renderização de sites dinâmicos

---

## 📦 Instalação

```bash
git clone https://github.com/Adinan001/ReactForge.git
cd ReactForge
npm install
```

## 🚀 Uso

```bash
# Clonagem básica
node src/index.js https://site.com

# Forçar renderização via Playwright
node src/index.js https://site.com --browser

# Limitar páginas e adicionar delay
node src/index.js https://site.com --max-pages=10 --delay=500

# Todas as opções
node src/index.js https://site.com --browser --max-pages=50 --delay=200
```

### Opções

| Flag | Descrição | Padrão |
|------|-----------|--------|
| `--browser` | Forçar renderização via Playwright | Automático |
| `--max-pages=N` | Máximo de páginas a clonar | 20 |
| `--delay=ms` | Delay entre requests em milissegundos | 0 |

O clone será salvo em `sites/<dominio>/` com toda a estrutura de assets organizada.

---

## 📂 Estrutura do Projeto

```text
ReactForge/
│
├── src/
│   ├── index.js
│   │
│   ├── crawler/
│   │   ├── analyzer.js
│   │   ├── resourceDetector.js
│   │   ├── htmlRewriter.js
│   │   ├── crawler.js
│   │   ├── siteCrawler.js
│   │   ├── assetDownloader.js
│   │   ├── browserFetcher.js
│   │   ├── crawlState.js
│   │   ├── robotsParser.js
│   │   ├── cssAssetCollector.js
│   │   ├── cssRewriter.js
│   │   ├── downloadCache.js
│   │   ├── fileOrganizer.js
│   │   ├── linkCollector.js
│   │   └── urlResolver.js
│   │
│   └── reports/
│       └── reporter.js
│
├── sites/
├── package.json
└── README.md
```

---

## 📌 Roadmap

### ✅ Fase 1 — Fidelidade Visual
- [x] Análise HTML completa com detecção de recursos especiais
- [x] Download de CSS, JS, imagens, favicons, manifest, fonts
- [x] Reescrita completa de URLs (HTML + CSS) para funcionamento offline
- [x] Caminhos relativos por profundidade de página
- [x] Suporte a Google Fonts e fontes externas

### ✅ Fase 2 — Playwright
- [x] Renderização JavaScript para SPAs
- [x] Detecção automática de conteúdo dinâmico
- [x] Auto-scroll para lazy loading
- [x] Filtro de tracking pixels e analytics

### ✅ Fase 3 — Download Inteligente
- [x] Download paralelo (5 simultâneos) com retry
- [x] Respeito a robots.txt com crawl-delay
- [x] Rate limiting configurável (`--delay`)
- [x] Resumo de crawl interrompido

### 🔜 Próximas Fases
- [ ] **CLI Profissional** — Commander.js com flags avançadas e barra de progresso
- [ ] **Export** — ZIP, single-file HTML, PDF, relatório de cobertura
- [ ] **Logs** — Log em arquivo, relatório JSON atualizado
- [ ] **NPM Publish** — `npm install -g reactforge`
- [ ] **Desktop GUI** — Interface gráfica com Electron ou Tauri

---

## 📄 Licença

Este projeto está sob licença MIT.

Desenvolvido por **[Adinan Lima](https://github.com/Adinan001)**