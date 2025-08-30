import { UserEntity } from 'src/common/types/entities';
import { IAuthRepository } from './interfaces/auth-repository.interface';
import { PrismaService } from 'src/database/modules/service/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly db: PrismaService) {}

  async getByEmail(email: string): Promise<UserEntity | null> {
    return await this.db.user.findUnique({
      where: { email },
    });
  }
}
