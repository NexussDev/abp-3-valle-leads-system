export enum Role {
  ATENDENTE = 'ATENDENTE',
  GERENTE = 'GERENTE',
  GERENTE_GERAL = 'GERENTE_GERAL',
  ADMIN = 'ADMIN'
}

export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}