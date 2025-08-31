import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FormsService } from '../services/forms.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { StepKey } from 'src/common/types/forms/forms';
import { ApiResponseMessage } from 'src/common/decorators/api-response-mensage.decorator';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/:stepKey')
  @HttpCode(HttpStatus.OK)
  @ApiResponseMessage('Schema de formulário retornado com sucesso')
  async getFormByStep(@Param('stepKey') stepKey: StepKey): Promise<any> {
    return await this.formsService.getFormByStep(stepKey);
  }
}
