import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEmail,
  Length,
  IsDefined,
} from 'class-validator';
import { validationMessages } from 'src/common/utils/validations-messages';

export class CreateNotifiedPersonRequestDTO {
  @IsUUID('4', { message: validationMessages.isUUID })
  @IsDefined({ message: validationMessages.isDefined })
  notificationId: string;

  @IsString({ message: validationMessages.isString })
  @Length(5, 100, { message: validationMessages.Length })
  name: string;

  @IsEmail({}, { message: validationMessages.isEmail })
  email: string;

  @IsString({ message: validationMessages.isString })
  phone: string;

  @IsString({ message: validationMessages.isString })
  @Length(8, 9, { message: 'O CEP deve ter 8 caracteres (com ou sem hífen).' })
  cep: string;

  @IsString({ message: validationMessages.isString })
  @Length(2, 2, {
    message: 'O estado deve ter exatamente 2 caracteres (ex: CE).',
  })
  state: string;

  @IsString({ message: validationMessages.isString })
  @Length(5, 100, { message: validationMessages.Length })
  city: string;

  @IsString({ message: validationMessages.isString })
  @Length(5, 100, { message: validationMessages.Length })
  neighborhood: string;

  @IsString({ message: 'O campo street deve ser uma string.' })
  @Length(5, 100, { message: validationMessages.Length })
  street: string;
}
