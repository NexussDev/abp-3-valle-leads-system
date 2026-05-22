export enum Role {
  ATENDENTE = 'ATENDENTE',
  LIDER_EQUIPE = 'LIDER_EQUIPE',
  GERENTE = 'GERENTE',
  GERENTE_GERAL = 'GERENTE_GERAL',
  ADMIN = 'ADMIN'
}

export interface AuthUser {
  id: string;
  role: Role;
  teamId: string | null;
  storeId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
