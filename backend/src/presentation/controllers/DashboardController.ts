import { Request, Response, NextFunction } from 'express';
import dashboardService from '../../application/services/DashboardService';

const DEFAULT_DAYS = 30;

function parseDateRange(query: Record<string, string>) {
  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  const startDate = query.startDate
    ? new Date(query.startDate)
    : new Date(endDate.getTime() - DEFAULT_DAYS * 24 * 60 * 60 * 1000);
  return { startDate, endDate };
}

class DashboardController {
  async operacional(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const range = parseDateRange(req.query as Record<string, string>);
      const data = await dashboardService.getOperacional(req.user!, range);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async analytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const range = parseDateRange(req.query as Record<string, string>);
      const data = await dashboardService.getAnalytico(req.user!, range);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
