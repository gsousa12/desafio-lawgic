import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SignInRequestDTO } from '../dtos/request/sign-in.dto';
import { Request, Response } from 'express';
import { ApiResponseMessage } from 'src/common/decorators/api-response-mensage.decorator';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { JwtPayload } from 'src/common/types/api/api.types';
import { SignUpRequestDTO } from '../dtos/request/sign-up.dto';
import { UserEntity } from 'src/common/types/entities';

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
    await this.authService.signIn(request, response);
  }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseMessage('Usuário admin criado com sucesso')
  async signUp(
    @Body() request: SignUpRequestDTO,
  ): Promise<Partial<UserEntity>> {
    const result = await this.authService.signUp(request);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/signout')
  @HttpCode(HttpStatus.OK)
  @ApiResponseMessage('Usuário deslogado com sucesso')
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    await this.authService.logout(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @ApiResponseMessage('Informações do usuário retornadas com sucesso')
  async getUserInfo(@User() user: JwtPayload): Promise<JwtPayload> {
    return user;
  }
}
