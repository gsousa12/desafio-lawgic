import { Response } from 'express';
import { SignInRequestDTO } from '../../dtos/request/sign-in.dto';

export interface IAuthService {
  signIn(request: SignInRequestDTO, response: Response): Promise<void>;
  logout(res: Response): Promise<void>;
}
