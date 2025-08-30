import { UserEntity } from 'src/common/types/entities';
import { SignUpRequestDTO } from '../../dtos/request/sign-up.dto';

export interface IAuthRepository {
  getByEmail(email: string): Promise<UserEntity | null>;
  createAdminUser(
    data: SignUpRequestDTO,
    hashedPassword: string,
  ): Promise<UserEntity>;
}
