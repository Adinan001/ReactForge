FROM node:22-slim

# Dependências do Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia dependências e instala
COPY package*.json ./
RUN npm install

# Instala browsers do Playwright
RUN npx playwright install chromium

# Copia código fonte
COPY src/ ./src/

# Pasta de saída
VOLUME /app/sites

ENTRYPOINT ["node", "src/index.js"]