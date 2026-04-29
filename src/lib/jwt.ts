import {
  SignJWT,
  jwtVerify,
  importPKCS8,
  importSPKI,
  errors as JoseErrors,
} from "jose";
import { privateKeyPem, publicKeyPem, KEY_ID, ISSUER } from "../config/keys";

export async function signJwt(
  payload: Record<string, unknown>,
  expiresIn: string,
) {
  const privateKey = await importPKCS8(privateKeyPem, "RS256");

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", kid: KEY_ID })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey);
}

export async function verifyJwt(
  token: string,
  options: { allowExpired?: boolean } = {},
) {
  const publicKey = await importSPKI(publicKeyPem, "RS256");
  try {
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: ISSUER,
      algorithms: ["RS256"],
    });

    return payload;
  } catch (err) {
    if (options.allowExpired && err instanceof JoseErrors.JWTExpired) {
      return err.payload;
    }
    throw err;
  }
}
