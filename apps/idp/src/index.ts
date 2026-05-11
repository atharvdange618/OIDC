import dotenv from "dotenv";
dotenv.config();
import { env } from "./config/env";

import express from "express";
import helmet from "helmet";
import path from "path";
import cors from "cors";
import hpp from "hpp";
import fs from "fs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { logger } from "./lib/logger";
import discoveryRouter from "./routes/discovery.routes";
import authRouter from "./routes/auth.routes";
import clientsRouter from "./routes/clients.routes";
import authorizeRouter from "./routes/authorize.routes";
import tokenRouter from "./routes/token.routes";
import userinfoRouter from "./routes/userinfo.routes";
import dashboardRouter from "./routes/dashboard.routes";

const app = express();
const PORT = env.PORT;

app.set("trust proxy", 1);
const PgSession = connectPgSimple(session);

app.set("view engine", "ejs");

const getViewsPath = () => {
  const possiblePaths = [
    path.join(process.cwd(), "src/views"),
    path.join(process.cwd(), "dist/views"),
    path.join(process.cwd(), "views"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return possiblePaths[0];
};

app.set("views", getViewsPath());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        connectSrc: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use(
  session({
    name: "idp_session",
    store: new PgSession({
      conString: env.DATABASE_URL,
      tableName: "session",
      pruneSessionInterval: 60 * 15,
    }),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.get("/", (req, res) => {
  res.redirect("/dashboard/developer");
});

app.use("/.well-known", discoveryRouter);
app.use("/auth", authRouter);
app.use("/clients", clientsRouter);
app.use("/authorize", authorizeRouter);
app.use("/dashboard", dashboardRouter);
app.use("/token", tokenRouter);
app.use("/userinfo", userinfoRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
      env: env.NODE_ENV,
      viewsPath: getViewsPath(),
    },
    "IdP server started",
  );
});
