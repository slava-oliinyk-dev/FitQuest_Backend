import { ITelegramService } from './telegram.service.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { IConfigService } from '../../config/config.service.interface';
import { ITelegramRepository } from './telegram.repository.interface';
import { ILogger } from '../../log/logger.interface';

@injectable()
export class TelegramService implements ITelegramService {
	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.TelegramRepository) private telegramRepository: ITelegramRepository,
		@inject(TYPES.ILogger) private loggerService: ILogger,
	) {}

	async consultationService(data: any): Promise<{ success: boolean; message?: string }> {
		const { email, name, message } = data;

		if (!email || !name || !message) {
			this.loggerService.error('[TelegramService] Missing required fields: email, name, or message');
			return { success: false, message: 'Missing required fields: email, name, or message' };
		}

		const formattedMessage = `New Consultation Request:
        Name: ${name}
        Email: ${email}
        Message: ${message}`;

		try {
			const result = await this.telegramRepository.consultationRepository({ message: formattedMessage });

			if (result.success) {
				this.loggerService.info(`[TelegramService] Consultation message sent successfully for ${email}`);
				return { success: true, message: 'Message sent successfully' };
			}

			this.loggerService.error(`[TelegramService] Error sending message to Telegram for ${email}`);
			return { success: false, message: 'Error sending message to Telegram' };
		} catch (error: any) {
			this.loggerService.error(`[TelegramService] Failed to send consultation message: ${error.message}`);
			return { success: false, message: 'Failed to send consultation message' };
		}
	}
}
