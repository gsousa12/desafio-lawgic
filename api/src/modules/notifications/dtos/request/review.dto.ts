import { IsDefined, IsEnum, IsString, IsUUID } from 'class-validator';
import { NotificatioReviewAction } from 'src/common/utils/enums';
import { validationMessages } from 'src/common/utils/validations-messages';

export class ReviewNotificationRequestDTO {
  @IsUUID('4', { message: validationMessages.isUUID })
  @IsDefined({ message: validationMessages.isDefined })
  notificationId: string;

  @IsString({ message: validationMessages.isString })
  @IsEnum(['back', 'approve', 'validate'], {
    message: validationMessages.isEnum,
  })
  action: string;
}
