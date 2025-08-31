import { Inject, Injectable } from '@nestjs/common';
import { INotificationsServiceInterface } from './interfaces/notifications-service.interface';
import { NOTIFICATIONS_REPOSITORY } from 'src/common/tokens/injection.tokens';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { CreateNotificationRequestDTO } from '../dtos/request/create.dto';
import { ApiException } from 'src/common/exceptions/api.exection';
import { CreateNotifiedPersonRequestDTO } from '../dtos/request/person.dto';
import { NotificationEntity } from 'src/common/types/entities';
import { Meta } from 'src/common/types/api/api.types';

@Injectable()
export class NotificationsService implements INotificationsServiceInterface {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async create(
    request: CreateNotificationRequestDTO,
    userId: string,
  ): Promise<void> {
    const notification = await this.notificationsRepository.getByTitle(
      request.title,
    );
    if (notification) {
      throw new ApiException('Já existe uma notificação com esse título', 409);
    }
    await this.notificationsRepository.create(request, userId);
  }

  async createNotifiedPerson(
    request: CreateNotifiedPersonRequestDTO,
  ): Promise<void> {
    const notification = await this.notificationsRepository.getById(
      request.notificationId,
    );
    if (!notification) {
      throw new ApiException(
        'Não existe uma notificação cadastrada com esse id',
        404,
      );
    }
    const person = await this.notificationsRepository.getPersonByNotificationId(
      request.notificationId,
    );
    if (person) {
      throw new ApiException(
        'Já existe uma pessoa a ser notificada cadastrada para essa notificação',
        409,
      );
    }

    await this.notificationsRepository.createNotifiedPerson(request);
  }

  async getAll(filters: {
    userId: string;
    userRole: string;
    page: number;
  }): Promise<{ data: NotificationEntity[]; meta: Meta }> {
    const { data, meta } = await this.notificationsRepository.getAll(filters);
    const response = {
      meta: meta,
      data: data,
    };
    return response;
  }
}
