import { FORMS_REPOSITORY } from 'src/common/tokens/injection.tokens';
import { FormsRepository } from '../repositories/forms.repository';
import { IFormsService } from './interfaces/forms-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ApiException } from 'src/common/exceptions/api.exection';

@Injectable()
export class FormsService implements IFormsService {
  constructor(
    @Inject(FORMS_REPOSITORY)
    private readonly formsRepository: FormsRepository,
  ) {}

  async getFormByStep(stepKey: string): Promise<any> {
    const form = await this.formsRepository.getFormByStep(stepKey);

    if (!form) {
      throw new ApiException(
        `Não foi possível achar um schema de formulário para: ${stepKey}`,
        404,
      );
    }

    return form.schemaJson;
  }
}
