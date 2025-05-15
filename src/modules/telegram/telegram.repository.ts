import { ITelegramRepository } from './telegram.repository.interface';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { TYPES } from '../../types';
import { ILogger } from '../../log/logger.interface';
import axios from 'axios';
import { IConfigService } from '../../config/config.service.interface';

@injectable()
export class TelegramRepository implements ITelegramRepository {
	private telegramApiUrl: string;
	private chatId: string;

	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		this.telegramApiUrl = `https://api.telegram.org/bot${this.configService.get('TELEGRAM_BOT_TOKEN')}/sendMessage`;
		this.chatId = this.configService.get('TELEGRAM_CHAT_ID');
	}
	async consultationRepository(data: any): Promise<{ success: boolean; message?: string }> {
		try {
			const formattedMessage =
				data.email && data.name && data.message
					? `New Consultation Request:
            Name: ${data.name}
            Email: ${data.email}
            Message: ${data.message}
            Date: ${data.date || new Date().toLocaleString()}`
					: data.message;

			await axios.post(this.telegramApiUrl, {
				chat_id: this.chatId,
				text: formattedMessage,
			});
			return { success: true };
		} catch (error: any) {
			this.loggerService.error('Failed to send data to Telegram:', error);
			return { success: false, message: 'Failed to send data to Telegram' };
		}
	}
}
