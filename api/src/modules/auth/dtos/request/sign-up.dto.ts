import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { UserRole } from 'src/common/utils/enums';
import { validationMessages } from 'src/common/utils/validations-messages';

export class SignUpRequestDTO {
  @IsString({ message: validationMessages.isString })
  @Length(3, 50, { message: validationMessages.Length })
  name: string;

  @IsString({ message: validationMessages.isString })
  @IsEmail({}, { message: validationMessages.isEmail })
  email: string;

  @IsString({ message: validationMessages.isString })
  @Length(8, 50, { message: validationMessages.Length })
  password: string;
}
