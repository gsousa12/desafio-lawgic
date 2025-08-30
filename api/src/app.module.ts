import { Module } from '@nestjs/common';
import { PrismaModule } from './database/modules/prisma.module';
import { AuthService } from './modules/auth/services/auth.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
