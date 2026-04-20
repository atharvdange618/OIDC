import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import discoveryRouter from "./routes/discovery.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/.well-known", discoveryRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`IdP running on http://localhost:${PORT}`);
});
