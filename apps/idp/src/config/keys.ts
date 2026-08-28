import fs from "fs";
import path from "path";
import { env } from "./env";

const readKey = (name: string) => {
  const file = ["src/keys", "dist/keys", "keys"]
    .map((dir) => path.resolve(process.cwd(), dir, name))
    .find(fs.existsSync);

  if (!file) {
    throw new Error(
      `${name} not found. Place it in apps/idp/src/keys/ (see README for the openssl commands).`,
    );
  }

  return fs.readFileSync(file, "utf-8");
};

const privateKeyPem = readKey("private.pem");
const publicKeyPem = readKey("public.pem");

export const KEY_ID = env.KEY_ID;
export const ISSUER = env.ISSUER;
export { privateKeyPem, publicKeyPem };
