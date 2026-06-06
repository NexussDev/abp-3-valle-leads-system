import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { AppError } from '../../shared/errors/AppError';
import { comparePassword } from '../../shared/utils/hash';
import { generateToken, TokenPayload } from '../../shared/utils/jwt';
import logService from './LogService';

const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha inválidos';

export class LoginService {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);

    const payload: TokenPayload = {
      sub: user.id,
      role: user.role,
      teamId: user.teamId ?? null,
      storeId: user.storeId ?? null,
    };

    const token = generateToken(payload);

    await logService.log(user.id, 'LOGIN', 'User', user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        storeId: user.storeId,
      },
      token,
    };
  }
}
