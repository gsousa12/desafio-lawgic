import { UserEntity } from 'src/common/types/entities';

export interface IAuthRepository {
  getByEmail(email: string): Promise<UserEntity | null>;
}
