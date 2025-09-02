import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NOTIFICATIONS_REPOSITORY } from 'src/common/tokens/injection.tokens';
import { ApiException } from 'src/common/exceptions/api.exection';
import { CreateNotificationRequestDTO } from '../dtos/request/create.dto';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: NotificationsRepository;

  const mockRepository = {
    getByTitle: jest.fn(),
    create: jest.fn(),
  };

  const mockCreateDto: CreateNotificationRequestDTO = {
    title: 'Notificação Teste',
    description: 'Descrição Teste',
    hearingDate: new Date('2025-10-23T13:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NOTIFICATIONS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get(NOTIFICATIONS_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar notificação quando o título não existe', async () => {
      const expectedResult = {
        id: 'notification-123',
        ...mockCreateDto,
        authorId: 'user-123',
      };

      mockRepository.getByTitle.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(mockCreateDto, 'user-123');

      expect(repository.getByTitle).toHaveBeenCalledWith(mockCreateDto.title);
      expect(repository.create).toHaveBeenCalledWith(mockCreateDto, 'user-123');
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar ApiException quando já existe notificação com o mesmo título', async () => {
      const existingNotification = {
        id: 'existing-123',
        title: 'Notificação Teste',
      };

      mockRepository.getByTitle.mockResolvedValue(existingNotification);

      await expect(service.create(mockCreateDto, 'user-123')).rejects.toThrow(
        ApiException,
      );

      await expect(service.create(mockCreateDto, 'user-123')).rejects.toThrow(
        'Já existe uma notificação com esse título',
      );

      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
