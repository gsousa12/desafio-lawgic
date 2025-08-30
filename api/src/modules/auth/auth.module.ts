import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { AUTH_REPOSITORY } from 'src/common/tokens/injection.tokens';
import { AuthRepository } from './repositories/auth.repository';
import { JwtStrategyService } from './services/jwt-strategy.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: 'segredo',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    AuthService,
    JwtStrategyService,
  ],
})
export class AuthModule {}
