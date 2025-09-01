import { Module } from '@nestjs/common';
import { PrismaModule } from './database/modules/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import configurations from './common/config/configurations';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { FormsModule } from './modules/forms/forms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configurations],
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    NotificationsModule,
    UsersModule,
    FormsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
