import { IsDateString, IsString, Length } from 'class-validator';
import { validationMessages } from 'src/common/utils/validations-messages';

export class CreateNotificationRequestDTO {
  @IsString({ message: validationMessages.isString })
  @Length(5, 100, { message: validationMessages.Length })
  title: string;

  @IsString({ message: validationMessages.isString })
  @Length(10, 500, { message: validationMessages.Length })
  description: string;

  @IsDateString({}, { message: validationMessages.isDate })
  hearingDate: Date;
}
