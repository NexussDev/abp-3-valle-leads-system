import { Request, Response, NextFunction } from 'express';
import dashboardService from '../../application/services/DashboardService';
import { Role } from '../../shared/types';

const DEFAULT_DAYS = 30;
const MAX_DAYS_NON_ADMIN = 365;

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

function parseDateRange(query: Record<string, string>, isAdmin: boolean) {
  const now = new Date();

  // Filtro por período pré-definido (semana, mês, ano)
  if (query.period) {
    const endDate = new Date(now);
    let startDate: Date;

    switch (query.period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        throw { status: 400, message: `Período inválido: "${query.period}". Use week, month ou year.` };
    }

    return { startDate, endDate };
  }

  // Filtro por datas customizadas
  const endDate = query.endDate ? new Date(query.endDate) : now;
  const startDate = query.startDate
    ? new Date(query.startDate)
    : new Date(endDate.getTime() - DEFAULT_DAYS * 24 * 60 * 60 * 1000);

  // Validar datas
  if (!isValidDate(startDate)) {
    throw { status: 400, message: 'startDate inválida.' };
  }
  if (!isValidDate(endDate)) {
    throw { status: 400, message: 'endDate inválida.' };
  }
  if (startDate > endDate) {
    throw { status: 400, message: 'startDate não pode ser maior que endDate.' };
  }

  // Validar limite de 1 ano para não-administradores
  if (!isAdmin) {
    const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > MAX_DAYS_NON_ADMIN) {
      throw { status: 403, message: 'Intervalo máximo permitido é de 1 ano.' };
    }
  }

  return { startDate, endDate };
}

function isAdmin(role: string): boolean {
  return role === Role.ADMIN;
}

class DashboardController {
  async operacional(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const range = parseDateRange(req.query as Record<string, string>, isAdmin(req.user!.role));
      const data = await dashboardService.getOperacional(req.user!, range);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async analytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const range = parseDateRange(req.query as Record<string, string>, isAdmin(req.user!.role));
      const data = await dashboardService.getAnalytico(req.user!, range);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();