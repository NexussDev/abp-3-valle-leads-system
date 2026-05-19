import userRepository from '../../infrastructure/repositories/UserRepository';
import { AppError } from '../../shared/errors/AppError';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';

class UserService {
  async findAll() {
    return userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    return user;
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    teamId?: string;
  }): Promise<Omit<User, 'password'>> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email já está em uso', 409);
    }

    if (data.password.length < 6) {
      throw new AppError('Senha deve ter pelo menos 6 caracteres', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as any,
      ...(data.teamId && { team: { connect: { id: data.teamId } } }),
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    await this.findById(id);
    return userRepository.update(id, data);
  }

  async updateMe(
    userId: string,
    data: {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ): Promise<Omit<User, 'password'>> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const updateData: Prisma.UserUpdateInput = {};

    if (data.name) updateData.name = data.name;

    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) throw new AppError('Email já está em uso', 409);
      updateData.email = data.email;
    }

    if (data.newPassword) {
      if (!data.currentPassword) throw new AppError('Senha atual é obrigatória', 400);
      const match = await bcrypt.compare(data.currentPassword, user.password);
      if (!match) throw new AppError('Senha atual incorreta', 401);
      if (data.newPassword.length < 6) throw new AppError('Nova senha deve ter pelo menos 6 caracteres', 400);
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await userRepository.update(userId, updateData);
    const { password: _, ...withoutPassword } = updated;
    return withoutPassword;
  }

  async delete(id: string): Promise<User> {
    await this.findById(id);
    return userRepository.delete(id);
  }
}

export default new UserService();
