import { Request, Response, NextFunction } from 'express';
import publicLeadService from '../../application/services/PublicLeadService';

class PublicLeadController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome, whatsapp, cidade, veiculo } = req.body;

      const lead = await publicLeadService.registerLead({
        nome,
        whatsapp,
        cidade,
        veiculo,
      });

      res.status(201).json({
        message: 'Cadastro realizado com sucesso! Em breve entraremos em contato.',
        lead: {
          id: lead.id,
          name: lead.name,
          status: lead.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PublicLeadController();
