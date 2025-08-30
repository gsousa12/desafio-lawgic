import { Response } from 'express';
import { SignInRequestDTO } from '../../dtos/request/sign-in.dto';
import { SignUpRequestDTO } from '../../dtos/request/sign-up.dto';
import { UserEntity } from 'src/common/types/entities';

export interface IAuthService {
  signIn(request: SignInRequestDTO, response: Response): Promise<void>;
  signUp(request: SignUpRequestDTO): Promise<Partial<UserEntity>>;
  logout(res: Response): Promise<void>;
}
