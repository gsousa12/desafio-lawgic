import { NotificationEntity } from 'src/common/types/entities';
import { CreateNotificationRequestDTO } from '../../dtos/request/create.dto';
import { CreateNotifiedPersonRequestDTO } from '../../dtos/request/person.dto';
import { NotifiedPersonEntity } from 'src/common/types/entities/person.entity';
import { Meta } from 'src/common/types/api/api.types';

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
}
