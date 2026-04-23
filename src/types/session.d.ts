import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    pendingAuthorize?: {
      client_id: string;
      redirect_uri: string;
      scope: string;
      state: string;
      code_challenge: string;
      code_challenge_method: string;
    };
  }
}
