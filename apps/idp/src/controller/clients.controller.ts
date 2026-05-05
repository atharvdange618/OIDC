import { Request, Response } from "express";
import { clientsService } from "../services/clients.service";
import {
  RegisterClientInput,
  UpdateClientInput,
} from "../validation/clients.validation";
import { logger } from "../lib/logger";

const log = logger.child({ module: "clients.controller" });

export class ClientsController {
  async register(req: Request, res: Response) {
    const developerId = req.session.userId;
    const result = await clientsService.register(
      req.body as RegisterClientInput,
      developerId,
    );
    log.info(
      { developerId, clientId: result.clientId },
      "Client registered successfully",
    );
    res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const developerId = req.session.userId!;
    const clientId = req.params.clientId as string;

    const result = await clientsService.update(
      clientId,
      developerId,
      req.body as UpdateClientInput,
    );
    log.info({ developerId, clientId }, "Client updated successfully");
    res.json(result);
  }
}

export const clientsController = new ClientsController();
