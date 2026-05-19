import { Request, Response, NextFunction } from 'express';
import logService from '../../application/services/LogService';

class LogController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) ?? '100', 10);
      const offset = parseInt((req.query.offset as string) ?? '0', 10);
      const result = await logService.findAll({ limit, offset });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new LogController();
