#!/bin/sh
set -e

KEYS_DIR="src/keys"
if [ ! -f "$KEYS_DIR/private.pem" ]; then
  echo "[entrypoint] generating RSA keypair in $KEYS_DIR"
  mkdir -p "$KEYS_DIR"
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$KEYS_DIR/private.pem"
  openssl rsa -in "$KEYS_DIR/private.pem" -pubout -out "$KEYS_DIR/public.pem"
fi

echo "[entrypoint] applying database migrations"
pnpm exec prisma migrate deploy

echo "[entrypoint] starting IdP"
exec pnpm dev
