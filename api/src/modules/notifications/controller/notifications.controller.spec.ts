import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationRequestDTO } from '../dtos/request/create.dto';
import { JwtPayload } from 'src/common/types/api/api.types';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockUser: JwtPayload = {
    name: 'Usuário Teste',
    userId: 'user-123',
    email: 'test@test.com',
    role: 'NOTIFIER',
  };

  const mockCreateDto: CreateNotificationRequestDTO = {
    title: 'Notificação Teste',
    description: 'Descrição Teste',
    hearingDate: new Date('2025-10-23T13:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma notificação com sucesso', async () => {
      const expectedResult = {
        id: 'notification-123',
        ...mockCreateDto,
        authorId: mockUser.userId,
      };

      mockNotificationsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(mockCreateDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(
        mockCreateDto,
        mockUser.userId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve passar o userId do JWT para o serviço', async () => {
      await controller.create(mockCreateDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, 'user-123');
    });
  });
});
