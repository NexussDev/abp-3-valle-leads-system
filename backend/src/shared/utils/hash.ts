import bcrypt from 'bcrypt';

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}