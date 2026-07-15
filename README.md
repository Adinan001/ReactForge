![Tests](https://github.com/Adinan001/ReactForge/actions/workflows/test.yml/badge.svg)

# ReactForge 🚀

Clonador de sites profissional desenvolvido em **Node.js** — 100% local, sem consumo de tokens ou APIs externas.

O ReactForge acessa uma página web, analisa sua estrutura completa, baixa todos os recursos (CSS, JS, imagens, favicons, fonts, manifest) e reconstrói o site localmente com reescrita automática de caminhos para funcionamento offline.

> **Por que ReactForge?** Clonadores baseados em IA (Claude Code + Playwright MCP) consomem centenas de milhares de tokens por execução. O ReactForge inverte essa lógica: o motor roda localmente sem custo, quantas vezes quiser.

---

## ⚠️ Aviso Importante

Este projeto foi desenvolvido **exclusivamente para fins de estudo, aprendizado e pesquisa** em desenvolvimento web, engenharia de software e tecnologias de crawling.

**Não utilize esta ferramenta para:**
- Clonar sites com o intuito de se passar pelo proprietário original
- Prática de phishing, falsificação de identidade ou fraudes
- Violação de direitos autorais, marcas registradas ou propriedade intelectual
- Qualquer atividade que viole leis locais, nacionais ou internacionais
- Reproduzir sites sem autorização do proprietário

**O uso ético e legal é de total responsabilidade do usuário.** O desenvolvedor não se responsabiliza por usos indevidos desta ferramenta. Ao utilizar o ReactForge, você concorda em respeitar os termos de serviço dos sites acessados e toda a legislação aplicável.

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

### Export
- ZIP do site completo (`--zip`)
- Single-file HTML com tudo inline em base64 (`--single-file`)
- PDF via Playwright (`--pdf`)
- Relatório de cobertura (`--coverage`)

### Análise de Backend
- Detecção automática de formulários, APIs, autenticação e integrações
- Geração de `backend-spec.json` com especificação estruturada
- Geração de `prompt.md` pronto para colar em qualquer IA

### Personalização Interativa
- Troca de nome/título, WhatsApp, email e telefone via terminal
- Detecção automática de cores do site com troca por paleta visual
- 8 famílias de cores × 4 tonalidades + hex customizado

### Docker
- Dockerfile pronto para containerização
- Roda sem instalar Node.js ou dependências localmente

---

## 🛠️ Tecnologias

- **Node.js** — Runtime
- **JavaScript ES Modules** — Arquitetura modular
- **Axios** — Requisições HTTP
- **Cheerio** — Parser HTML
- **Playwright** — Renderização de sites dinâmicos
- **Commander.js** — CLI profissional
- **Inquirer** — Interface interativa no terminal
- **Vitest** — Testes unitários
- **Docker** — Containerização

---

## 📦 Instalação

```bash
git clone https://github.com/Adinan001/ReactForge.git
cd ReactForge
npm install
```

### Via Docker

```bash
docker build -t reactforge .
docker run --rm -v ${PWD}/sites:/app/sites reactforge https://site.com
```

## 🚀 Uso

```bash
# Clonagem básica
node src/index.js clone https://site.com

# Forçar renderização via Playwright
node src/index.js clone https://site.com --browser

# Limitar páginas e adicionar delay
node src/index.js clone https://site.com --max-pages=10 --delay=500

# Modo silencioso com barra de progresso
node src/index.js clone https://site.com --quiet

# Exportar em múltiplos formatos
node src/index.js clone https://site.com --zip --single-file --pdf

# Relatório de cobertura
node src/index.js clone https://site.com --coverage

# Análise de backend
node src/index.js clone https://site.com --analyze-backend

# Personalizar site clonado
node src/index.js customize sites/site.com

# Pasta de saída customizada
node src/index.js clone https://site.com --output=clones
```

### Opções

| Flag | Descrição | Padrão |
|------|-----------|--------|
| `--browser` | Forçar renderização via Playwright | Automático |
| `--max-pages <n>` | Máximo de páginas a clonar | 20 |
| `--delay <ms>` | Delay entre requests em milissegundos | 0 |
| `--output <dir>` | Pasta de saída | sites/ |
| `--user-agent <string>` | User-Agent customizado | Chrome |
| `--quiet` | Modo silencioso com barra de progresso | false |
| `--zip` | Gerar ZIP do site clonado | false |
| `--single-file` | Gerar HTML único com tudo inline | false |
| `--pdf` | Gerar PDF do site clonado | false |
| `--coverage` | Gerar relatório de cobertura | false |
| `--analyze-backend` | Detectar necessidades de backend | false |

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
│   │   ├── fileOrganizer.js
│   │   ├── linkCollector.js
│   │   ├── progress.js
│   │   └── urlResolver.js
│   │
│   ├── export/
│   │   ├── zipExporter.js
│   │   ├── singleFileExporter.js
│   │   ├── pdfExporter.js
│   │   ├── coverageReport.js
│   │   └── backendAnalyzer.js
│   │
│   ├── customize/
│   │   └── customizer.js
│   │
│   ├── utils/
│   │   └── logger.js
│   │
│   └── reports/
│       └── reporter.js
│
├── tests/
│   ├── analyzer.test.js
│   ├── fileOrganizer.test.js
│   └── urlResolver.test.js
│
├── .github/workflows/
│   └── test.yml
│
├── Dockerfile
├── .dockerignore
├── package.json
├── LICENSE
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

### ✅ Fase 4 — CLI Profissional
- [x] Commander.js com --help e --version
- [x] Barra de progresso com ETA
- [x] Modo --quiet

### ✅ Fase 5 — Export
- [x] ZIP do site completo
- [x] Single-file HTML (tudo inline em base64)
- [x] PDF via Playwright
- [x] Relatório de cobertura

### ✅ Fase 6 — Integridade e Logs
- [x] Log em arquivo (clone-log.txt)
- [x] --output para pasta de saída customizada
- [x] --user-agent configurável
- [x] --quiet completo

### ✅ Fase 7 — Qualidade e Testes
- [x] Testes unitários com Vitest (31 testes)
- [x] GitHub Actions CI
- [x] Badge "tests passing"

### ✅ Fase 8 — Personalização e Backend
- [x] Módulo customize interativo
- [x] Análise de backend (formulários, APIs, auth, integrações)
- [x] Geração de backend-spec.json + prompt.md

### ✅ Fase 9 — Distribuição (parcial)
- [x] Docker (Dockerfile + .dockerignore)
- [x] Package.json preparado para NPM
- [x] LICENSE MIT
- [ ] NPM publish
- [ ] Executável standalone (.exe)
- [ ] Desktop GUI (Electron/Tauri)

---

## 📄 Licença

Este projeto está sob licença MIT.

Desenvolvido por **[Adinan Lima](https://github.com/Adinan001)**