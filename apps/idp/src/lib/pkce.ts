import crypto from "crypto";

export function verifyPkce(
  codeVerifier: string,
  storedChallenge: string,
): boolean {
  const computed = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return computed === storedChallenge;
}
