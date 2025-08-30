import { Inject, Injectable } from '@nestjs/common';
import { IUsersServiceInterface } from './interfaces/users-service.interface';
import { USERS_REPOSITORY } from 'src/common/tokens/injection.tokens';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService implements IUsersServiceInterface {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
  ) {}
}
