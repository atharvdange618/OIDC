import { Request, Response } from "express";
import { clientsService } from "../services/clients.service";
import { RegisterClientInput } from "../validation/clients.validation";

export class ClientsController {
  async register(req: Request, res: Response) {
    const result = await clientsService.register(
      req.body as RegisterClientInput,
    );
    res.status(201).json(result);
  }
}

export const clientsController = new ClientsController();
