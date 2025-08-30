import { SetMetadata } from '@nestjs/common';

export const ApiResponseMessage = (message: string) =>
  SetMetadata('responseMessage', message);
