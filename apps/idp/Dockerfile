# Build context is the repo root (see docker-compose.yml), because pnpm needs
# the workspace manifests. The IdP has no workspace deps of its own.
FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app
COPY . .

RUN pnpm install --filter kleis-idp

WORKDIR /app/apps/idp
RUN pnpm exec prisma generate \
  && sed -i 's/\r$//' docker-entrypoint.sh \
  && chmod +x docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
