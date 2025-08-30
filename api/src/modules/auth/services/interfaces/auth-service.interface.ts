import { Response } from 'express';
import { SignInRequestDTO } from '../../dtos/request/sign-in.dto';
import { UserEntity } from 'src/common/types/entities';

export interface IAuthService {
  signIn(request: SignInRequestDTO, response: Response): Promise<void>;
}
