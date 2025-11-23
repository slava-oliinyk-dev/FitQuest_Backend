import { BaseController } from '../../common/base.controller';
import { ITelegramController } from './telegram.controller.interface';
import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { ILogger } from '../../log/logger.interface';
import 'reflect-metadata';
import { HTTPError } from '../../errors/http-error.class';
import { ITelegramService } from './telegram.service.interface';
import { ConsultationDto } from './dto/consultation.dto';
import { ValidateMiddleware } from '../../common/validate.middleware';

@injectable()
export class TelegramController extends BaseController implements ITelegramController {
  constructor(
    @inject(TYPES.ILogger) private readonly loggerService: ILogger,
    @inject(TYPES.TelegramService) private readonly telegramService: ITelegramService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/consultation',
        method: 'post',
        func: this.sendConsultationController,
        middlewares: [new ValidateMiddleware(ConsultationDto)],
      },
    ]);
  }

  async sendConsultationController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationDto: ConsultationDto = req.body;
      this.loggerService.info(
        `[TelegramController] Received consultation request from ${consultationDto.email}.`,
      );

      const result = await this.telegramService.sendConsultation(consultationDto);

      if (!result.success) {
        this.loggerService.warn(
          `[TelegramController] Failed to process consultation request for ${consultationDto.email}: ${result.message}`,
        );
        return next(new HTTPError(502, result.message));
      }

      this.ok(res, result);
    } catch (error: any) {
      this.loggerService.error(
        `[TelegramController] Error handling consultation request: ${error.message}`,
      );
      next(error);
    }
  }
}
