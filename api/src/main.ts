import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/exceptions.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ApiResponseInterceptor(reflector));
  app.useGlobalFilters(new ApiExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
