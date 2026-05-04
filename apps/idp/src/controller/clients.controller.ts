import { Request, Response } from "express";
import { clientsService } from "../services/clients.service";
import {
  RegisterClientInput,
  UpdateClientInput,
} from "../validation/clients.validation";

export class ClientsController {
  async register(req: Request, res: Response) {
    const developerId = (req as any).auth?.sub ?? (req.session as any)?.userId;
    const result = await clientsService.register(
      req.body as RegisterClientInput,
      developerId,
    );
    res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const developerId = (req as any).auth?.sub ?? (req.session as any)?.userId;
    const clientId = req.params.clientId as string;
    try {
      const result = await clientsService.update(
        clientId,
        developerId,
        req.body as UpdateClientInput,
      );
      res.json(result);
    } catch (err: any) {
      if (err.message === "Client not found or unauthorized") {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}

export const clientsController = new ClientsController();
