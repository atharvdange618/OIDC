import { Router, Request, Response } from "express";
import { getJwks } from "../lib/jwks";
import { ISSUER } from "../config/keys";

const router = Router();

router.get("/openid-configuration", (req: Request, res: Response) => {
  res.json({
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/authorize`,
    token_endpoint: `${ISSUER}/token`,
    userinfo_endpoint: `${ISSUER}/userinfo`,
    jwks_uri: `${ISSUER}/.well-known/jwks.json`,
    scopes_supported: ["openid", "profile", "email"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    code_challenge_methods_supported: ["S256"],
  });
});

router.get("/jwks.json", async (req: Request, res: Response) => {
  const jwks = await getJwks();
  res.json(jwks);
});

export default router;
