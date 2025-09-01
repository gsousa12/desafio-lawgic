import { PrismaService } from 'src/database/modules/service/prisma.service';
import { IFormsRepository } from './interfaces/forms-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FormsRepository implements IFormsRepository {
  constructor(private readonly db: PrismaService) {}

  async getFormByStep(stepKey: string): Promise<any> {
    const form = await this.db.formSchema.findFirst({
      where: { stepKey: stepKey, isActive: true },
    });
    return form ?? null;
  }
}
