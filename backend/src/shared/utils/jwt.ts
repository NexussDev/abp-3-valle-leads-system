import jwt from 'jsonwebtoken';
import { Role } from '../types';

export interface TokenPayload {
  sub: string;
  role: string;
  teamId: string | null;
  storeId: string | null;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
}
