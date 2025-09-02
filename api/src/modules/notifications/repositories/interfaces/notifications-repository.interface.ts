import { NotificationEntity } from 'src/common/types/entities';
import { CreateNotificationRequestDTO } from '../../dtos/request/create.dto';
import { CreateNotifiedPersonRequestDTO } from '../../dtos/request/person.dto';
import { NotifiedPersonEntity } from 'src/common/types/entities/person.entity';
import { JwtPayload, Meta } from 'src/common/types/api/api.types';
import { ReviewNotificationRequestDTO } from '../../dtos/request/review.dto';

export interface INotificationsRepositoryInterface {
  create(request: CreateNotificationRequestDTO, userId: string): Promise<void>;
  createNotifiedPerson(request: CreateNotifiedPersonRequestDTO): Promise<void>;
  getByTitle(title: string): Promise<NotificationEntity | null>;
  getById(id: string): Promise<NotificationEntity | null>;
  getPersonByNotificationId(
    notificationId: string,
  ): Promise<NotifiedPersonEntity | null>;
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
