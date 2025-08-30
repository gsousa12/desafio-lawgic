import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAuthService } from './interfaces/auth-service.interface';
import { SignInRequestDTO } from '../dtos/request/sign-in.dto';
import { Response } from 'express';
import { AuthRepository } from '../repositories/auth.repository';
import { AUTH_REPOSITORY } from 'src/common/tokens/injection.tokens';
import { ApiException } from 'src/common/exceptions/api.exection';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/types/api/api.types';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}
  async signIn(request: SignInRequestDTO, response: Response): Promise<void> {
    const user = await this.authRepository.getByEmail(request.email);

    if (!user) {
      throw new ApiException('Usuário não encontrado', 404);
    }

    const isValidPassword = user.password === request.password;
    if (!isValidPassword) {
      throw new ApiException('Credenciais inválidas', 404);
    }

    const payload: JwtPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const isProductionEnvironment = process.env.NODE_ENV === 'production';

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProductionEnvironment,
      sameSite: isProductionEnvironment ? 'none' : 'lax',
      maxAge: Number(3600000),
    });
  }
}
