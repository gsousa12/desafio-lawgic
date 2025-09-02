import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { INotificationsServiceInterface } from './interfaces/notifications-service.interface';
import { NOTIFICATIONS_REPOSITORY } from 'src/common/tokens/injection.tokens';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { CreateNotificationRequestDTO } from '../dtos/request/create.dto';
import { ApiException } from 'src/common/exceptions/api.exection';
import { CreateNotifiedPersonRequestDTO } from '../dtos/request/person.dto';
import { JwtPayload, Meta } from 'src/common/types/api/api.types';
import { ReviewNotificationRequestDTO } from '../dtos/request/review.dto';
import { EditNotificationRequestDto } from '../dtos/request/edit-notification.dto';
import { EditNotifiedRequestPersonDto } from '../dtos/request/edit-person.dto';

@Injectable()
export class NotificationsService implements INotificationsServiceInterface {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async create(
    request: CreateNotificationRequestDTO,
    userId: string,
  ): Promise<any> {
    const notification = await this.notificationsRepository.getByTitle(
      request.title,
    );
    if (notification) {
      throw new ApiException('Já existe uma notificação com esse título', 409);
    }
    return await this.notificationsRepository.create(request, userId);
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
  }): Promise<{ data: any; meta: Meta }> {
    const { data, meta } = await this.notificationsRepository.getAll(filters);
    const response = {
      meta: meta,
      data: data.length === 1 ? [data] : data,
    };
    return response;
  }

  async review(
    request: ReviewNotificationRequestDTO,
    user: JwtPayload,
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

    await this.notificationsRepository.review(request, user);
  }

  async editNotification(request: EditNotificationRequestDto): Promise<void> {
    const current = await this.notificationsRepository.getById(
      request.notificationId,
    );
    if (!current) {
      throw new ApiException(
        'Não existe uma notificação cadastrada com esse id',
        404,
      );
    }

    const data: Partial<EditNotificationRequestDto> = {};
    if (request.title !== undefined) data.title = request.title.trim();
    if (request.description !== undefined)
      data.description = request.description.trim();
    if (request.hearingDate !== undefined)
      data.hearingDate = request.hearingDate;

    if (Object.keys(data).length === 0) {
      throw new ApiException('Nenhum campo para atualizar foi fornecido.', 400);
    }

    return this.notificationsRepository.updateById(
      request.notificationId,
      data,
    );
  }

  async editNotifiedPerson(
    request: EditNotifiedRequestPersonDto,
  ): Promise<void> {
    const current =
      await this.notificationsRepository.getPersonByNotificationId(
        request.notificationId,
      );
    if (!current) {
      throw new ApiException(
        'Notificado não encontrado para esta notificação.',
        404,
      );
    }

    const data: Partial<EditNotifiedRequestPersonDto> = {};
    if (request.name !== undefined) data.name = request.name.trim();
    if (request.email !== undefined) data.email = request.email.trim();
    if (request.phone !== undefined) data.phone = request.phone.trim();
    if (request.cep !== undefined) data.cep = request.cep.trim();
    if (request.state !== undefined) data.state = request.state.trim();
    if (request.city !== undefined) data.city = request.city.trim();
    if (request.neighborhood !== undefined)
      data.neighborhood = request.neighborhood.trim();
    if (request.street !== undefined) data.street = request.street.trim();

    if (Object.keys(data).length === 0) {
      throw new ApiException('Nenhum campo para atualizar foi fornecido.', 400);
    }

    return this.notificationsRepository.updateByNotificationId(
      request.notificationId,
      data,
    );
  }
}
