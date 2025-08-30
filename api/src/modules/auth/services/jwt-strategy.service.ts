// import { Injectable } from '@nestjs/common';
// import { Strategy } from 'passport-jwt';
// import { Request } from 'express';
// import { ExtractJwt } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { JwtPayload } from 'src/common/types/api/api.types';
// import { ConfigService } from '@nestjs/config';
// import { AppConfig } from 'src/common/config/configurations';

// @Injectable()
// export class JwtStrategyService extends PassportStrategy(Strategy) {
//   constructor(private configService: ConfigService<AppConfig, true>) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (req: Request) => {
//           const token = req?.cookies?.access_token;
//           return token || null;
//         },
//       ]),
//       secretOrKey: configService.get('jwtSecret', { infer: true }),
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const jwtSecret = this.configService.get('jwtSecret', { infer: true });
//     console.log('JWT Secret:', jwtSecret);
//     console.log('Payload JWT:', payload);
//     return payload;
//   }
// }
