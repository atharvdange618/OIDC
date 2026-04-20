import { importSPKI, exportJWK } from "jose";
import { publicKeyPem, KEY_ID } from "../config/keys";

export async function getJwks() {
  const publicKey = await importSPKI(publicKeyPem, "RS256");
  const jwk = await exportJWK(publicKey);

  return {
    keys: [
      {
        ...jwk,
        use: "sig",
        alg: "RS256",
        kid: KEY_ID,
      },
    ],
  };
}
