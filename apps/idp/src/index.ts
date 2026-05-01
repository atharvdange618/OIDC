import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import path from "path";
import cors from "cors";
import hpp from "hpp";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { errorHandler } from "./middleware/errorHandler";
import discoveryRouter from "./routes/discovery.routes";
import authRouter from "./routes/auth.routes";
import clientsRouter from "./routes/clients.routes";
import authorizeRouter from "./routes/authorize.routes";
import tokenRouter from "./routes/token.routes";
import userinfoRouter from "./routes/userinfo.routes";
import dashboardRouter from "./routes/dashboard.routes";

const app = express();
const PORT = process.env.PORT ?? 4000;
const PgSession = connectPgSimple(session);

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/views"));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        connectSrc: ["'self'"],
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
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) throw new Error("SESSION_SECRET is required");

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      pruneSessionInterval: 60 * 15,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/.well-known", discoveryRouter);
app.use("/auth", authRouter);
app.use("/clients", clientsRouter);
app.use("/authorize", authorizeRouter);
app.use("/dashboard", dashboardRouter);
app.use("/token", tokenRouter);
app.use("/userinfo", userinfoRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`IdP running on http://localhost:${PORT}`);
});
