import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SignInRequestDTO } from '../dtos/request/sign-in.dto';
import { Response } from 'express';
import { ApiResponseMessage } from 'src/common/decorators/api-response-mensage.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @ApiResponseMessage('Usuário logado com sucesso')
  async signIn(
    @Body() request: SignInRequestDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    return await this.authService.signIn(request, response);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiResponseMessage('Usuário deslogado com sucesso')
  async logout(@Res({ passthrough: true }) response: Response) {
    return await this.authService.logout(response);
  }
}
