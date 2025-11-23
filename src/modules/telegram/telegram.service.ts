import { ITelegramService } from './telegram.service.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { ITelegramRepository } from './telegram.repository.interface';
import { ILogger } from '../../log/logger.interface';
import { ConsultationDto } from './dto/consultation.dto';

@injectable()
export class TelegramService implements ITelegramService {
	constructor(
		@inject(TYPES.TelegramRepository) private readonly telegramRepository: ITelegramRepository,
		@inject(TYPES.ILogger) private readonly loggerService: ILogger,
	) {}

	async sendConsultation(data: ConsultationDto): Promise<{ success: boolean; message: string }> {
		const { email, name, message } = data;

		const formattedMessage = `New Consultation Request:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;
		try {
			const result = await this.telegramRepository.sendMessage(formattedMessage);

			if (result.success) {
				this.loggerService.info(`[TelegramService] Consultation message sent successfully for ${email}.`);
				return { success: true, message: 'Message sent successfully' };
			}
			const failureMessage = result.message || 'Error sending message to Telegram';
			this.loggerService.warn(`[TelegramService] ${failureMessage} for ${email}.`);
			return { success: false, message: failureMessage };
		} catch (error: any) {
			const errorMessage = error?.message || 'Unknown error';
			this.loggerService.error(`[TelegramService] Failed to send consultation message: ${errorMessage}`);
			return { success: false, message: 'Failed to send consultation message' };
		}
	}
}
