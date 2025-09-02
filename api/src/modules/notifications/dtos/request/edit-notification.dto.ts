import {
  IsUUID,
  IsOptional,
  IsString,
  Length,
  IsISO8601,
} from 'class-validator';
import { validationMessages } from 'src/common/utils/validations-messages';

export class EditNotificationRequestDto {
  @IsUUID('4', { message: validationMessages.isUUID })
  notificationId!: string;

  @IsOptional()
  @IsString({ message: 'O campo title deve ser uma string.' })
  @Length(3, 120, { message: 'O título deve ter entre 3 e 120 caracteres.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'O campo description deve ser uma string.' })
  @Length(10, 1000, {
    message: 'A descrição deve ter entre 10 e 1000 caracteres.',
  })
  description?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'A data/hora deve estar em formato ISO-8601.' })
  hearingDate?: string;
}
