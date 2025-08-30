import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'src/common/types/api/api.types';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies?.access_token;
          return token || null;
        },
      ]),
      secretOrKey: String('segredo'),
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
