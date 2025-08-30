import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ApiException } from '../exceptions/api.exection';

@Injectable()
export class SingleErrorPipe implements PipeTransform<any> {
  constructor(
    private readonly options?: {
      whitelist?: boolean;
      forbidNonWhitelisted?: boolean;
    },
  ) {}

  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    if (this.options?.whitelist) {
      const dtoInstance = new metatype();
      const validKeys = Object.keys(dtoInstance);
      Object.keys(value).forEach((key) => {
        if (!validKeys.includes(key)) {
          delete value[key];
        }
      });
    }

    // if (this.options?.forbidNonWhitelisted && type === 'body') {
    //   const dtoInstance = new metatype();
    //   const validKeys = Object.keys(dtoInstance);
    //   const invalidKeys = Object.keys(value).filter(
    //     (key) => !validKeys.includes(key),
    //   );

    //   if (invalidKeys.length > 0) {
    //     throw new BadRequestException({
    //       success: false,
    //       message: `Campos não permitidos: ${invalidKeys.join(', ')}`,
    //     });
    //   }
    // }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const firstError = errors[0];
      const firstErrorMessage = Object.values(firstError.constraints ?? {})[0];

      throw new ApiException(firstErrorMessage, 400);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
