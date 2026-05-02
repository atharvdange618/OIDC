import fs from "fs";
import path from "path";

const getPrivateKey = () => {
  const possiblePaths = [
    path.resolve(process.cwd(), "src/keys/private.pem"),
    path.resolve(process.cwd(), "dist/keys/private.pem"),
    path.resolve(process.cwd(), "keys/private.pem"),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
  }

  throw new Error(
    "Private key not found. Please provide PRIVATE_KEY env var or place private.pem in src/keys/",
  );
};

const getPublicKey = () => {
  const possiblePaths = [
    path.resolve(process.cwd(), "src/keys/public.pem"),
    path.resolve(process.cwd(), "dist/keys/public.pem"),
    path.resolve(process.cwd(), "keys/public.pem"),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
  }

  throw new Error(
    "Public key not found. Please provide PUBLIC_KEY env var or place public.pem in src/keys/",
  );
};

const privateKeyPem = getPrivateKey();
const publicKeyPem = getPublicKey();

export const KEY_ID = process.env.KEY_ID ?? "key-1";
export const ISSUER = process.env.ISSUER ?? "http://localhost:4000";
export { privateKeyPem, publicKeyPem };
