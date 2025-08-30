import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAuthService } from './interfaces/auth-service.interface';
import { SignInRequestDTO } from '../dtos/request/sign-in.dto';
import { Response } from 'express';
import { AuthRepository } from '../repositories/auth.repository';
import { AUTH_REPOSITORY } from 'src/common/tokens/injection.tokens';
import { ApiException } from 'src/common/exceptions/api.exection';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/types/api/api.types';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/common/config/configurations';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private configService: ConfigService<AppConfig, true>,
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

    const isProductionEnvironment = this.configService.get('isProduction', {
      infer: true,
    });

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProductionEnvironment,
      sameSite: isProductionEnvironment ? 'none' : 'lax',
      maxAge: Number(3600000),
    });
  }

  async logout(res: Response): Promise<void> {
    const isProductionEnvironment = this.configService.get('isProduction', {
      infer: true,
    });

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProductionEnvironment,
      sameSite: isProductionEnvironment ? 'none' : 'lax',
      path: '/',
    });
  }
}
