# KanShan Basketball — Render Web Service image
# Secrets (DEEPSEEK_API_KEY / ZHIHU_ACCESS_SECRET) are injected at runtime only.

FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    tar \
    unzip \
    python3 \
  && rm -rf /var/lib/apt/lists/*

# HOME drives official Linux CLI install path:
#   $HOME/.local/share/zhihu-cli/current/zhihu-cli
ENV HOME=/root \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=10000 \
    HOSTNAME=0.0.0.0 \
    ZHIHU_CLI=/root/.local/share/zhihu-cli/current/zhihu-cli

WORKDIR /app

# Install all deps (including build tooling). Keep NODE_ENV unset until after build
# so npm ci does not skip devDependencies required by `next build`.
COPY package.json package-lock.json ./
RUN npm ci

# Application source (no .env.local / secrets — see .dockerignore).
COPY . .

# Build Next.js (does not need Zhihu auth / DeepSeek at build time).
RUN npm run build \
  && npm prune --omit=dev

ENV NODE_ENV=production

# Install official Zhihu CLI via Skill setup (binary only; no auth set).
WORKDIR /tmp/zhihu-cli-skill
RUN curl --fail --silent --show-error --location \
      --output zhihu-cli-skill.zip \
      "https://developer-cdn.zhihu.com/zhihu-cli/releases/stable/skill/zhihu-cli-skill.zip" \
  && unzip -q zhihu-cli-skill.zip \
  && sh zhihu/scripts/setup.sh \
  && test -x /root/.local/share/zhihu-cli/current/zhihu-cli \
  && rm -rf /tmp/zhihu-cli-skill

WORKDIR /app

RUN chmod +x /app/docker-entrypoint.sh \
  && cp /app/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 10000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
