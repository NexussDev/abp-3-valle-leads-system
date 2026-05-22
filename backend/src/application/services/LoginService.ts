import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { comparePassword } from '../../shared/utils/hash';
import { generateToken, TokenPayload } from '../../shared/utils/jwt';
import logService from './LogService';

export class LoginService {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new Error('E-mail ou senha inválidos');

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) throw new Error('E-mail ou senha inválidos');

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
