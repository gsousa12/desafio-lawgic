import { Module } from '@nestjs/common';
import { FormsController } from './controller/forms.controller';
import { FormsService } from './services/forms.service';
import { FormsRepository } from './repositories/forms.repository';
import { FORMS_REPOSITORY } from 'src/common/tokens/injection.tokens';

@Module({
  controllers: [FormsController],
  providers: [
    FormsService,
    {
      provide: FORMS_REPOSITORY,
      useClass: FormsRepository,
    },
  ],
})
export class FormsModule {}
