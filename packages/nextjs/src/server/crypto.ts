import { base64url } from "jose";

export function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  globalThis.crypto.getRandomValues(array);
  return base64url.encode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", data);
  return base64url.encode(new Uint8Array(hash));
}
