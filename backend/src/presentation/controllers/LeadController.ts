import { Request, Response, NextFunction } from 'express';
import leadService, {
  DEFAULT_RECAPTURE_DAYS,
} from '../../application/services/LeadService';
import logService from '../../application/services/LogService';
import userRepository from '../../infrastructure/repositories/UserRepository';
import { AppError } from '../../shared/errors/AppError';

const DEFAULT_DAYS = 30;

class LeadController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate: sd, endDate: ed } = req.query as Record<string, string>;

      if (sd && isNaN(new Date(sd).getTime())) {
        res.status(400).json({ status: 'error', message: 'startDate inválido' });
        return;
      }
      if (ed && isNaN(new Date(ed).getTime())) {
        res.status(400).json({ status: 'error', message: 'endDate inválido' });
        return;
      }

      const endDate = ed ? new Date(ed) : new Date();
      const startDate = sd
        ? new Date(sd)
        : new Date(endDate.getTime() - DEFAULT_DAYS * 24 * 60 * 60 * 1000);

      const leads = await leadService.findAll(req.user!, startDate, endDate);
      res.status(200).json(leads);
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await leadService.findById(req.params['id'] as string, req.user!);
      res.status(200).json(lead);
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Ownership deriva da sessão autenticada, nunca do body
      const authUser = req.user!;

      const user = await userRepository.findById(authUser.id);
      if (!user?.teamId || !user?.storeId) {
        res.status(422).json({
          status: 'error',
          message: 'Usuário sem loja ou equipe configurada. Contate o administrador.',
        });
        return;
      }

      const lead = await leadService.create({
        name:    req.body.name,
        phone:   req.body.phone,
        origin:  req.body.origin,
        importance: req.body.importance,
        userId:  authUser.id,   // ← sessão, não body
        teamId:  user.teamId,   // ← banco, não body
        storeId: user.storeId,  // ← banco, não body
      });

      await logService.log(authUser.id, 'CREATE', 'Lead', lead.id);
      res.status(201).json(lead);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('Body recebido:', JSON.stringify(req.body));
      const lead = await leadService.update(req.params['id'] as string, req.user!, req.body);
      await logService.log(req.user!.id, 'UPDATE', 'Lead', lead.id);
      res.status(200).json(lead);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await leadService.delete(req.params['id'] as string, req.user!);
      await logService.log(req.user!.id, 'DELETE', 'Lead', req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async recapture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const raw = (req.query['days'] as string | undefined) ?? '';
      const days = raw === '' ? DEFAULT_RECAPTURE_DAYS : Number.parseInt(raw, 10);
      if (Number.isNaN(days)) {
        throw new AppError('days inválido (esperado inteiro).', 400);
      }
      const leads = await leadService.findForRecapture(req.user!, days);
      res.status(200).json({ days, count: leads.length, leads });
    } catch (error) {
      next(error);
    }
  }

  async contact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await leadService.markContacted(req.params['id'] as string, req.user!);
      await logService.log(req.user!.id, 'CONTACT', 'Lead', lead.id);
      res.status(200).json(lead);
    } catch (error) {
      next(error);
    }
  }
}

export default new LeadController();
