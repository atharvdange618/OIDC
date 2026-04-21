import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import { errorHandler } from "./middleware/errorHandler";
import discoveryRouter from "./routes/discovery.routes";
import authRouter from "./routes/auth.routes";
import clientsRouter from "./routes/clients.routes";
import authorizeRouter from "./routes/authorize.routes";
import tokenRouter from "./routes/token.routes";
import userinfoRouter from "./routes/userinfo.routes";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet());
app.use(cors());
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/.well-known", discoveryRouter);
app.use("/auth", authRouter);
app.use("/clients", clientsRouter);
app.use("/authorize", authorizeRouter);
app.use("/token", tokenRouter);
app.use("/userinfo", userinfoRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`IdP running on http://localhost:${PORT}`);
});
