import { Request, Response, NextFunction } from 'express';
import negotiationService from '../../application/services/NegotiationService';
import logService from '../../application/services/LogService';

class NegotiationController {
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const negotiation = await negotiationService.findByLeadId(req.params.leadId as string);
      res.status(200).json(negotiation);
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const negotiation = await negotiationService.create(req.params.leadId as string, req.body);
      await logService.log(req.user!.id, 'CREATE', 'Negotiation', negotiation.id);
      res.status(201).json(negotiation);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const negotiation = await negotiationService.update(req.params.leadId as string, req.body);
      await logService.log(req.user!.id, 'UPDATE', 'Negotiation', negotiation.id);
      res.status(200).json(negotiation);
    } catch (error) {
      next(error);
    }
  }
}

export default new NegotiationController();
