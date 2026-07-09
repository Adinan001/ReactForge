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

### Download de Assets
- CSS, JavaScript, imagens, favicons, manifest, fonts
- Organização automática por tipo
- Cache de downloads para evitar duplicatas

### Reescrita de URLs para Offline
- Atributos: `src`, `href`, `poster`, `data-src`, `data-lazy`, `background`
- Tags: `link`, `script`, `img`, `source`, `video`, `audio`, `iframe`, `object`, `embed`
- `srcset` completo com descriptors preservados
- Inline styles e tags `<style>` com `url()`
- Meta tags Open Graph e Twitter Cards
- Remoção automática de `integrity` e `crossorigin`

### Crawler Multi-Página
- Varredura automática de links internos
- Deduplicação de URLs com normalização de trailing slash
- Limite configurável de páginas
- Estrutura de diretórios espelhando o path original do site

### Relatórios
- Relatório JSON com análise completa
- Log detalhado no terminal com seções organizadas

---

## 🛠️ Tecnologias

- **Node.js** — Runtime
- **JavaScript ES Modules** — Arquitetura modular
- **Axios** — Requisições HTTP
- **Cheerio** — Parser HTML
- **File System API** — Manipulação de arquivos

---

## 📦 Instalação

```bash
git clone https://github.com/Adinan001/ReactForge.git
cd ReactForge
npm install
```

## 🚀 Uso

```bash
node src/index.js https://site.com
```

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

### ✅ Concluído
- [x] Crawler básico com Axios
- [x] Análise HTML completa
- [x] Detecção de recursos especiais (favicons, manifest, Open Graph, JSON-LD)
- [x] Download de CSS, JS, imagens, favicons, manifest, fonts
- [x] Reescrita completa de URLs para funcionamento offline
- [x] Crawler multi-página com deduplicação
- [x] Organização de assets por tipo
- [x] Relatório JSON

### 🔜 Próximas Fases
- [ ] **CSS Rewriter** — Reescrita de URLs dentro dos arquivos CSS
- [ ] **Playwright** — Renderização JavaScript para SPAs
- [ ] **CLI Profissional** — Flags: `--depth`, `--max-pages`, `--output`, `--timeout`
- [ ] **Download Paralelo** — Concorrência controlada com retry e backoff
- [ ] **Export** — ZIP, single-file HTML, PDF, relatório de cobertura
- [ ] **NPM Publish** — `npm install -g reactforge`
- [ ] **Desktop GUI** — Interface gráfica com Electron ou Tauri

---

## 📄 Licença

Este projeto está sob licença MIT.

Desenvolvido por **Adinan Lima** — (https://github.com/Adinan001)