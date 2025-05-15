import { BaseController } from '../../common/base.controller';
import { ITelegramController } from './telegram.controller.interface';
import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { ILogger } from '../../log/logger.interface';
import 'reflect-metadata';
import { HTTPError } from '../../errors/http-error.class';
import { ITelegramService } from './telegram.service.interface';
import { IConfigService } from '../../config/config.service.interface';

@injectable()
export class TelegramController extends BaseController implements ITelegramController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.TelegramService) private telegramService: ITelegramService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService);
		this.bindRoutes([{ path: '/consultation', method: 'post', func: this.consultation }]);
	}

	async consultation(req: Request, res: Response, next: NextFunction): Promise<void> {
		const result = await this.telegramService.consultationService(req.body);
		if (!result) {
			return next(new HTTPError(400, 'Error receiving data in telegram'));
		}
		this.ok(res, result);
	}
}
