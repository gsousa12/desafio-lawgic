import { IsEmail, IsString, Length } from 'class-validator';
import { validationMessages } from 'src/common/utils/validations-messages';

export class SignInRequestDTO {
  @IsString({ message: validationMessages.isString })
  @IsEmail({}, { message: validationMessages.isEmail })
  email: string;

  @IsString({ message: validationMessages.isString })
  @Length(8, 50, { message: validationMessages.Length })
  password: string;
}
