import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/exceptions.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ApiResponseInterceptor(reflector));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
