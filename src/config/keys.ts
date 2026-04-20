import fs from "fs";
import path from "path";

const privateKeyPem = fs.readFileSync(
  path.resolve(process.cwd(), "keys/private.pem"),
  "utf-8",
);

const publicKeyPem = fs.readFileSync(
  path.resolve(process.cwd(), "keys/public.pem"),
  "utf-8",
);

export const KEY_ID = process.env.KEY_ID ?? "key-1";
export const ISSUER = process.env.ISSUER ?? "http://localhost:4000";
export { privateKeyPem, publicKeyPem };
