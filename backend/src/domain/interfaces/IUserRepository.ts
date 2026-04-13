export interface IUserRepository {
  findByEmail(email: string): Promise<any | null>;
}