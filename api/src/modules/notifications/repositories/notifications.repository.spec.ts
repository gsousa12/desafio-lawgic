import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsRepository } from './notifications.repository';
import { PrismaService } from 'src/database/modules/service/prisma.service';
import { CreateNotificationRequestDTO } from '../dtos/request/create.dto';
import { NotificationStatus } from 'src/common/utils/enums';

describe('NotificationsRepository', () => {
  let repository: NotificationsRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockCreateDto: CreateNotificationRequestDTO = {
    title: 'Notificação Teste',
    description: 'Descrição Teste',
    hearingDate: new Date('2025-10-23T13:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<NotificationsRepository>(NotificationsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma notificação com os dados corretos', async () => {
      const expectedResult = {
        id: 'notification-123',
        authorId: 'user-123',
        title: mockCreateDto.title,
        description: mockCreateDto.description,
        hearingDate: new Date(mockCreateDto.hearingDate),
        status: NotificationStatus.InProgress,
      };

      mockPrismaService.notification.create.mockResolvedValue(expectedResult);

      const result = await repository.create(mockCreateDto, 'user-123');

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          authorId: 'user-123',
          title: mockCreateDto.title,
          description: mockCreateDto.description,
          hearingDate: expect.any(Date),
          status: NotificationStatus.InProgress,
        },
      });

      expect(result).toEqual(expectedResult);
    });

    it('deve ajustar a data da audiência em 3 horas', async () => {
      await repository.create(mockCreateDto, 'user-123');

      const callArgs = mockPrismaService.notification.create.mock.calls[0][0];
      const passedDate = callArgs.data.hearingDate;
      const originalDate = new Date(mockCreateDto.hearingDate);

      // Verifica se a diferença é de 3 horas
      const hoursDiff =
        (passedDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).toBe(3);
    });
  });

  describe('getByTitle', () => {
    it('deve encontrar notificação pelo título', async () => {
      const expectedNotification = {
        id: 'notification-123',
        title: 'Notificação Teste',
      };

      mockPrismaService.notification.findFirst.mockResolvedValue(
        expectedNotification,
      );

      const result = await repository.getByTitle('Notificação Teste');

      expect(prismaService.notification.findFirst).toHaveBeenCalledWith({
        where: {
          title: 'Notificação Teste',
        },
      });

      expect(result).toEqual(expectedNotification);
    });

    it('deve retornar null quando a notificação não for encontrada', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      const result = await repository.getByTitle('Inexistente');

      expect(result).toBeNull();
    });
  });
});
