import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { comparePassword } from '../../shared/utils/hash';
import { generateToken } from '../../shared/utils/jwt';

export class LoginService {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('E-mail ou senha inválidos');
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new Error('E-mail ou senha inválidos');
    }

    const token = generateToken({
      sub: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
    
  }
}