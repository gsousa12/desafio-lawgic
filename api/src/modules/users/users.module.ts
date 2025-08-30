import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.module';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { USERS_REPOSITORY } from 'src/common/tokens/injection.tokens';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],
})
export class UsersModule {}
