import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class RandomDelayInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    const randomDelay = Math.floor(Math.random() * 1000) + 500;
    return next.handle().pipe(delay(randomDelay));
  }
}
