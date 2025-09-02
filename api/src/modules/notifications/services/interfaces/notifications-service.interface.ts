import { NotificationEntity } from 'src/common/types/entities';
import { CreateNotificationRequestDTO } from '../../dtos/request/create.dto';
import { CreateNotifiedPersonRequestDTO } from '../../dtos/request/person.dto';
import { JwtPayload, Meta } from 'src/common/types/api/api.types';
import { ReviewNotificationRequestDTO } from '../../dtos/request/review.dto';

export interface INotificationsServiceInterface {
  create(request: CreateNotificationRequestDTO, userId: string): Promise<void>;
  createNotifiedPerson(request: CreateNotifiedPersonRequestDTO): Promise<void>;
  getAll(filters: {
    userId: string;
    userRole: string;
    page: number;
  }): Promise<{ data: NotificationEntity[]; meta: Meta }>;

  review(
    request: ReviewNotificationRequestDTO,
    user: JwtPayload,
  ): Promise<void>;
}
