import { Injectable } from '@nestjs/common';
import { IUsersRepositoryInterface } from './interfaces/users-repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepositoryInterface {}
