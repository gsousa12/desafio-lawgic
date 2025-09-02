import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiException } from '../exceptions/api.exection';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
    if (err || !user) {
      throw new ApiException(
        'Você não está autorizado para realizar essa ação',
        401,
      );
    }
    return user;
  }
}
