import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiResponseMessage } from 'src/common/decorators/api-response-mensage.decorator';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationRequestDTO } from '../dtos/request/create.dto';
import { User } from 'src/common/decorators/user.decorator';
import { JwtPayload, Meta } from 'src/common/types/api/api.types';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateNotifiedPersonRequestDTO } from '../dtos/request/person.dto';
import { NotificationEntity } from 'src/common/types/entities';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseMessage('Notificação criada com sucesso')
  async create(
    @Body() request: CreateNotificationRequestDTO,
    @User() user: JwtPayload,
  ): Promise<void> {
    const userId = user.userId;
    await this.notificationsService.create(request, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/person')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseMessage('Pessoa a ser notificada criada com sucesso')
  async createNotifiedPerson(
    @Body() request: CreateNotifiedPersonRequestDTO,
  ): Promise<void> {
    await this.notificationsService.createNotifiedPerson(request);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiResponseMessage('Lista de notificações retornada com sucesso')
  async getAll(
    @Query() request: { page: string },
    @User() user: JwtPayload,
  ): Promise<{ data: NotificationEntity[]; meta: Meta }> {
    const userId = user.userId;
    const userRole = user.role;
    const parsedPage = parseInt(request.page, 10) || 1;

    const filters = {
      userId,
      userRole,
      page: parsedPage,
    };
    const result = await this.notificationsService.getAll(filters);
    return result;
  }
}
