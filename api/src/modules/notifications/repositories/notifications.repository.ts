import { Injectable } from '@nestjs/common';
import { INotificationsRepositoryInterface } from './interfaces/notifications-repository.interface';
import { PrismaService } from 'src/database/modules/service/prisma.service';
import { CreateNotificationRequestDTO } from '../dtos/request/create.dto';
import {
  NotificationStatus,
  NotificatioReviewAction,
  UserRole,
} from 'src/common/utils/enums';
import { NotificationEntity } from 'src/common/types/entities';
import { CreateNotifiedPersonRequestDTO } from '../dtos/request/person.dto';
import { NotifiedPersonEntity } from 'src/common/types/entities/person.entity';
import { JwtPayload, Meta } from 'src/common/types/api/api.types';
import { ReviewNotificationRequestDTO } from '../dtos/request/review.dto';
import { EditNotificationRequestDto } from '../dtos/request/edit-notification.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsRepository
  implements INotificationsRepositoryInterface
{
  constructor(private readonly db: PrismaService) {}

  async create(
    request: CreateNotificationRequestDTO,
    userId: string,
  ): Promise<any> {
    return await this.db.notification.create({
      data: {
        authorId: userId,
        title: request.title,
        description: request.description,
        hearingDate: request.hearingDate,
        status: NotificationStatus.InProgress,
      },
    });
  }

  async createNotifiedPerson(
    request: CreateNotifiedPersonRequestDTO,
  ): Promise<void> {
    return this.db.$transaction(async (prisma) => {
      await prisma.notifiedPerson.create({
        data: {
          notificationId: request.notificationId,
          name: request.name,
          email: request.email,
          phone: request.phone,
          cep: request.cep,
          state: request.state,
          city: request.city,
          neighborhood: request.neighborhood,
          street: request.street,
        },
      });

      await prisma.notification.update({
        where: {
          id: request.notificationId,
        },
        data: {
          status: NotificationStatus.Validation,
        },
      });
    });
  }

  async getByTitle(title: string): Promise<NotificationEntity | null> {
    return this.db.notification.findFirst({
      where: {
        title,
      },
    });
  }

  getById(id: string): Promise<NotificationEntity | null> {
    return this.db.notification.findUnique({
      where: {
        id,
      },
    });
  }

  async getPersonByNotificationId(
    notificationId: string,
  ): Promise<NotifiedPersonEntity | null> {
    return await this.db.notifiedPerson.findFirst({
      where: {
        notificationId: notificationId,
      },
    });
  }

  async getAll(filters: {
    userId: string;
    userRole: string;
    page: number;
  }): Promise<{ data: NotificationEntity[]; meta: Meta }> {
    const limit = 10;
    const page = filters.page > 0 ? filters.page : 1;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      canceledAt: null,
    };

    if (filters.userRole === UserRole.Notifier) {
      whereClause.authorId = filters.userId;
    }

    if (filters.userRole === UserRole.Reviewer) {
      whereClause.status = {
        in: [NotificationStatus.Validation, NotificationStatus.Completed],
      };
    }

    const [totalCount, notifications] = await this.db.$transaction([
      this.db.notification.count({ where: whereClause }),
      this.db.notification.findMany({
        where: whereClause,
        include: { notifiedPerson: true },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
      },
      data: notifications,
    };
  }

  async review(
    request: ReviewNotificationRequestDTO,
    user: JwtPayload,
  ): Promise<void> {
    if (request.action === 'approve') {
      await this.db.notification.update({
        data: {
          status: NotificationStatus.Completed,
          reviewerId: user.userId,
        },
        where: {
          id: request.notificationId,
        },
      });
    }
    if (request.action === 'back') {
      await this.db.notification.update({
        data: {
          status: NotificationStatus.InProgress,
          reviewerId: user.userId,
        },
        where: {
          id: request.notificationId,
        },
      });
    }

    if (request.action === 'validate') {
      await this.db.notification.update({
        data: {
          status: NotificationStatus.Validation,
        },
        where: {
          id: request.notificationId,
        },
      });
    }
  }

  async updateById(
    id: string,
    data: Prisma.NotificationUpdateInput,
  ): Promise<void> {
    await this.db.notification.update({
      where: { id },
      data,
    });
  }

  async updateByNotificationId(
    notificationId: string,
    data: Partial<EditNotificationRequestDto>,
  ): Promise<void> {
    await this.db.notifiedPerson.update({
      where: { notificationId },
      data,
    });
  }
}
